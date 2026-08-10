# Razorpay Payment Gateway Integration
### Full-Stack (Node.js + React) — Step-by-Step Guide for Students

---

## What We Are Building

A complete payment flow for a food ordering app:

```
Customer clicks "Place Order"
        ↓
Backend creates a Razorpay Order (gets an order_id)
        ↓
Frontend opens the Razorpay Checkout popup
        ↓
Customer pays (test card / UPI)
        ↓
Razorpay calls our handler with payment IDs
        ↓
Backend verifies the signature (security check)
        ↓
Order is marked as paid ✅
```

---

## Prerequisites

| What | Where |
|------|-------|
| Razorpay Account | [https://razorpay.com](https://razorpay.com) → Sign Up |
| Test API Keys | Dashboard → Settings → API Keys → Generate Test Key |
| Node.js backend | Express + Mongoose |
| React frontend | Vite / CRA |

> **Test keys** always start with `rzp_test_`. They let you make payments without real money.

---

## Step 1 — Get Your Razorpay Test Keys

1. Log in to [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Go to **Settings → API Keys**
3. Click **Generate Test Key**
4. Copy `Key ID` and `Key Secret` — you only see the secret **once**

---

## Step 2 — Backend Setup

### 2.1 Install the Razorpay Node SDK

```bash
cd server
npm install razorpay
```

### 2.2 Add Keys to `.env`

```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYYYYYY
```

> ⚠️ Never commit `.env` to Git. Add it to `.gitignore`.

### 2.3 Create the Payment Controller

`server/src/controller/payment.controller.js`

```js
import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";

// Lazily create Razorpay instance so missing keys fail loudly
const getRazorpayInstance = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

// ─── Helper: find a customer's order safely ─────────────────────────────────
const getCustomerOrder = async (userId, orderId) => {
  const customer = await Customer.findOne({ customerId: userId });
  if (!customer) return null;
  return Order.findOne({ _id: orderId, customerId: customer._id });
};

// ─── POST /payment/create-order ──────────────────────────────────────────────
// 1. Takes the app's orderId from the body
// 2. Creates a Razorpay order (amount in paise, 1 INR = 100 paise)
// 3. Saves the razorpayOrderId on our order document
// 4. Returns key + order details to the frontend
export const CreateRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      const err = new Error("orderId is required");
      err.statusCode = 400;
      return next(err);
    }

    const order = await getCustomerOrder(req.user._id, orderId);
    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      return next(err);
    }

    if (order.paymentDetails?.paymentStatus === "completed") {
      const err = new Error("Payment already completed for this order");
      err.statusCode = 400;
      return next(err);
    }

    const razorpay = getRazorpayInstance();

    // Razorpay expects amount in the SMALLEST currency unit (paise for INR)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.billDetails.finalAmount * 100), // e.g. ₹250 → 25000
      currency: "INR",
      receipt: `receipt_${order._id}`,        // your internal reference
      notes: { appOrderId: String(order._id) }, // optional metadata
    });

    // Save the Razorpay order ID so we can match it during verification
    order.paymentDetails.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(200).json({
      message: "Razorpay order created",
      data: {
        key: process.env.RAZORPAY_KEY_ID, // sent to frontend to open checkout
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        appOrderId: order._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /payment/verify ────────────────────────────────────────────────────
// After the user pays, Razorpay sends 3 IDs to the frontend handler.
// We MUST verify the HMAC-SHA256 signature on the backend to confirm
// the payment was not tampered with.
export const VerifyRazorpayPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      const err = new Error("All payment verification fields are required");
      err.statusCode = 400;
      return next(err);
    }

    const order = await getCustomerOrder(req.user._id, orderId);
    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      return next(err);
    }

    // ── Signature Verification (CRITICAL security step) ──────────────────────
    // Razorpay signs: "razorpay_order_id|razorpay_payment_id"
    // using your Key Secret as the HMAC key.
    // If the computed hash matches the received signature → payment is genuine.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Signatures don't match → payment was tampered with
      order.paymentDetails.paymentStatus = "failed";
      order.orderStatus = "failed";
      await order.save();

      const err = new Error("Payment signature verification failed");
      err.statusCode = 400;
      return next(err);
    }

    // ── Payment is verified. Update the order ────────────────────────────────
    order.paymentDetails.paymentStatus = "completed";
    order.paymentDetails.razorpayOrderId = razorpay_order_id;
    order.paymentDetails.razorpayPaymentId = razorpay_payment_id;
    order.paymentDetails.razorpaySignature = razorpay_signature;
    order.paymentDetails.paidAt = new Date();
    order.orderStatus = "accepted"; // move order to next stage
    await order.save();

    return res.status(200).json({
      message: "Payment verified and order successful",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
```

### 2.4 Create the Payment Router

`server/src/router/payment.route.js`

```js
import express from "express";
import { AuthProtect } from "../middleware/auth.middelware.js";
import { CreateRazorpayOrder, VerifyRazorpayPayment } from "../controller/payment.controller.js";

const router = express.Router();

router.post("/create-order", AuthProtect, CreateRazorpayOrder);
router.post("/verify",       AuthProtect, VerifyRazorpayPayment);

export default router;
```

### 2.5 Register the Router in `index.js`

```js
import PaymentRouter from "./src/router/payment.route.js";

// ... other routes
app.use("/payment", PaymentRouter);
```

### 2.6 Add Razorpay Fields to the Order Model

Add these inside `paymentDetails` in `order.model.js`:

```js
paymentDetails: {
  type: {
    paymentMethod:      { type: String, enum: ["card", "upi"], required: true },
    paymentStatus:      { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    razorpayOrderId:    { type: String },   // ← add
    razorpayPaymentId:  { type: String },   // ← add
    razorpaySignature:  { type: String },   // ← add
    paidAt:             { type: Date },
  },
},
```

---

## Step 3 — Frontend Setup

### 3.1 Add the Key to `.env.development`

```env
VITE_RAZORPAY_API_KEY=rzp_test_XXXXXXXXXXXX
```

> Vite requires all custom env variables to start with `VITE_`.

### 3.2 Load the Razorpay Checkout Script Dynamically

Razorpay's checkout is a CDN script. We load it only when needed:

```js
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Already loaded (e.g. user opened checkout before)
    if (window.Razorpay) { resolve(true); return; }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
```

### 3.3 Wire Up `handlePlaceOrder` in `Cart.jsx`

```js
const handlePlaceOrder = async () => {
  // 1. Guard checks
  if (!isLogin)              { toast.error("Please login first"); return; }
  if (role !== "customer")   { toast.error("Only customers can order"); return; }
  if (!cart?.items?.length)  { toast.error("Cart is empty"); return; }

  try {
    setIsPlacingOrder(true);

    // 2. Create the app-level order in our database
    const createOrderRes = await api.post("/order/create", {
      restaurantId: cart.restaurantId,
      paymentMethod: "upi",
      orderItems: cart.items.map((i) => ({ itemId: i._id, quantity: i.quantity })),
    });
    const appOrderId = createOrderRes?.data?.data?._id;

    // 3. Ask our backend to create a Razorpay order
    //    Backend talks to Razorpay API → returns razorpayOrderId + amount
    const paymentOrderRes = await api.post("/payment/create-order", { orderId: appOrderId });
    const paymentData = paymentOrderRes?.data?.data;

    // 4. Load the Razorpay JS SDK
    const loaded = await loadRazorpayScript();
    if (!loaded) { toast.error("Razorpay SDK failed to load"); return; }

    // 5. Open the Razorpay checkout popup
    const options = {
      key:         paymentData.key,            // Your Key ID
      amount:      paymentData.amount,         // In paise (already set by backend)
      currency:    paymentData.currency,       // "INR"
      name:        "Cravings",
      description: "Food Order Payment",
      order_id:    paymentData.razorpayOrderId, // The Razorpay order ID (not our DB ID)

      // 6. Called by Razorpay when payment SUCCEEDS
      handler: async function (response) {
        // response contains:
        //   razorpay_order_id   - the Razorpay order ID
        //   razorpay_payment_id - the payment transaction ID
        //   razorpay_signature  - HMAC signature to verify on backend

        try {
          await api.post("/payment/verify", {
            orderId:              appOrderId,
            razorpay_order_id:    response.razorpay_order_id,
            razorpay_payment_id:  response.razorpay_payment_id,
            razorpay_signature:   response.razorpay_signature,
          });

          toast.success("Payment successful!");
          clearCart();
          navigate("/customer-dashboard");
        } catch (err) {
          toast.error(err.response?.data?.message || "Payment verification failed");
        }
      },

      prefill: {
        // Pre-fill customer details (optional)
        // name: user.fullName,
        // email: user.email,
      },

      theme: { color: "#f97316" }, // Brand color

      modal: {
        ondismiss: () => toast.error("Payment cancelled"),
      },
    };

    const rzp = new window.Razorpay(options);

    // Called when payment FAILS inside the popup
    rzp.on("payment.failed", function (response) {
      toast.error(`Payment failed: ${response.error.description}`);
    });

    rzp.open(); // Open the popup!

  } catch (error) {
    toast.error(error.response?.data?.message || "Something went wrong");
  } finally {
    setIsPlacingOrder(false);
  }
};
```

---

## Step 4 — Making a Test Payment

Razorpay provides test credentials. Use any of these in the checkout popup:

### Test Cards (select "Card" in popup)

| Card Number | Expiry | CVV | Result |
|-------------|--------|-----|--------|
| `4111 1111 1111 1111` | Any future date | Any 3 digits | ✅ Success |
| `5267 3181 8797 5449` | Any future date | Any 3 digits | ✅ Success |
| `4000 0000 0000 0002` | Any future date | Any 3 digits | ❌ Failure |

### Test UPI

| UPI ID | Result |
|--------|--------|
| `success@razorpay` | ✅ Success |
| `failure@razorpay` | ❌ Failure |

> For OTP on test cards, use `1234` or just click "Skip OTP" in the test popup.

---

## Step 5 — How Signature Verification Works

This is the most important security concept.

```
razorpay_order_id  ─┐
                    ├─→ HMAC-SHA256( key = RAZORPAY_KEY_SECRET ) → expectedSignature
razorpay_payment_id─┘

If  expectedSignature === razorpay_signature  →  Payment is genuine ✅
If  expectedSignature !== razorpay_signature  →  Someone tampered with the data ❌
```

**Why is this necessary?**  
Without signature verification, anyone could send a fake `razorpay_payment_id` to your verify endpoint and trick your server into marking an order as paid without actually paying.

---

## Step 6 — Data Flow Summary

```
[Cart.jsx]
  POST /order/create  →  creates Order { paymentStatus: "pending" }
  POST /payment/create-order  →  backend calls Razorpay API → gets razorpayOrderId
  opens window.Razorpay({ order_id: razorpayOrderId })

[User pays in popup]

[Cart.jsx handler()]
  POST /payment/verify  →  backend verifies HMAC signature
                        →  updates Order { paymentStatus: "completed", orderStatus: "accepted" }

[Navigate to dashboard]
```

---

## Common Mistakes to Avoid

| Mistake | Fix |
|---------|-----|
| Using live keys in development | Always use `rzp_test_` keys while building |
| Not verifying signature on backend | Always verify — never trust the frontend alone |
| Using the wrong amount unit | Razorpay uses **paise** (₹1 = 100 paise). Multiply by 100. |
| Committing `.env` to Git | Add `.env` to `.gitignore` |
| Creating `window.Razorpay` without loading the script | Always await `loadRazorpayScript()` first |
| Sending `appOrderId` as `order_id` | `order_id` in checkout options must be the **Razorpay** order ID, not your DB `_id` |

---

## Quick Reference — API Endpoints

| Method | Endpoint | What it does |
|--------|----------|-------------|
| `POST` | `/payment/create-order` | Creates Razorpay order, returns `razorpayOrderId` |
| `POST` | `/payment/verify` | Verifies HMAC signature, marks order paid |

---

## Environment Variables Checklist

**Backend (`server/.env`)**
```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYYYYYY
```

**Frontend (`client/.env.development`)**
```env
VITE_RAZORPAY_API_KEY=rzp_test_XXXXXXXXXXXX
```
