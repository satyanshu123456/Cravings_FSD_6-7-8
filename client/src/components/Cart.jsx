import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../config/ApiConfig";
import toast from "react-hot-toast";
import { foodTypeDot } from "./publicRestaurantDetails/helpers";
import {
  IoCartOutline,
  IoTrashOutline,
  IoArrowBack,
  IoStorefrontOutline,
  IoLocationOutline,
  IoAddCircleOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";
import {
  IoIosAddCircleOutline,
  IoIosRemoveCircleOutline,
} from "react-icons/io";
import { MdOutlineRestaurantMenu } from "react-icons/md";

const Cart = () => {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrForm, setNewAddrForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
    addressType: "home",
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const {
    cart,
    totalItems,
    totalPrice,
    increaseItem,
    decreaseItem,
    removeItem,
    clearCart,
  } = useCart();
  const { isLogin, role, user } = useAuth();
  const navigate = useNavigate();

  // Load customer address book
  useEffect(() => {
    if (isLogin && role === "customer") {
      const fetchAddresses = async () => {
        try {
          const res = await api.get("/customer/address-book");
          const list = res.data.data || [];
          setAddresses(list);
          if (list.length > 0) {
            const defaultAddr = list.find((a) => a.isDefault) || list[0];
            setSelectedAddressId(defaultAddr._id);
          }
        } catch (error) {
          console.error("Failed to fetch address book:", error);
        }
      };
      fetchAddresses();
    }
  }, [isLogin, role]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddrForm.name || !newAddrForm.address || !newAddrForm.city || !newAddrForm.pinCode) {
      toast.error("Please fill required address fields");
      return;
    }
    try {
      setIsSavingAddress(true);
      const res = await api.post("/customer/address-book", newAddrForm);
      const updatedList = res.data.data || [];
      setAddresses(updatedList);
      if (updatedList.length > 0) {
        setSelectedAddressId(updatedList[updatedList.length - 1]._id);
      }
      setShowAddAddress(false);
      setNewAddrForm({
        name: "",
        address: "",
        city: "",
        state: "",
        pinCode: "",
        country: "India",
        addressType: "home",
      });
      toast.success("Delivery address saved!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!isLogin) {
      toast.error("Please login first to place an order");
      navigate("/login");
      return;
    }

    if (role !== "customer") {
      toast.error("Only customers can place an order");
      return;
    }

    if (!cart?.items?.length) {
      toast.error("Your cart is empty");
      return;
    }

    const selectedAddr = addresses.find((a) => a._id === selectedAddressId);
    let deliveryAddress = null;
    if (selectedAddr) {
      deliveryAddress = {
        name: selectedAddr.name || user?.fullName || "Customer",
        address: selectedAddr.address,
        city: selectedAddr.city,
        state: selectedAddr.state || "State",
        pinCode: selectedAddr.pinCode,
        country: selectedAddr.country || "India",
      };
    }

    try {
      setIsPlacingOrder(true);

      // 1. Create order in database
      const createOrderRes = await api.post("/order/create", {
        restaurantId: cart.restaurantId,
        paymentMethod: "upi",
        deliveryAddress: deliveryAddress || undefined,
        orderItems: cart.items.map((i) => ({
          itemId: i._id,
          quantity: i.quantity,
        })),
      });
      const appOrderId = createOrderRes?.data?.data?._id;

      // 2. Ask backend to create a Razorpay order
      const paymentOrderRes = await api.post("/payment/create-order", {
        orderId: appOrderId,
      });
      const paymentData = paymentOrderRes?.data?.data;

      // 3. Load the Razorpay JS SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Razorpay SDK failed to load. Please check your internet connection.");
        return;
      }

      // 4. Open Razorpay checkout modal
      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency || "INR",
        name: "Cravings",
        description: `Order from ${cart.restaurantName || "Cravings"}`,
        order_id: paymentData.razorpayOrderId,
        handler: async function (response) {
          try {
            await api.post("/payment/verify", {
              orderId: appOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment verified! Your order has been placed.");
            clearCart();
            navigate("/customer-dashboard", { state: { activeTab: "orders" } });
          } catch (err) {
            toast.error(
              err.response?.data?.message || "Payment verification failed",
            );
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#c2410c" },
        modal: {
          ondismiss: () => toast.error("Payment cancelled"),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error(`Payment failed: ${response.error?.description || "Transaction declined"}`);
      });

      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong while placing order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!cart.items.length) {
    return (
      <div className="min-h-screen bg-(--color-base-200) flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 rounded-full bg-(--color-base-300) flex items-center justify-center">
          <IoCartOutline className="text-5xl text-(--color-secondary)" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-(--color-base-content) mb-1">
            Your cart is empty
          </h2>
          <p className="text-sm text-(--color-secondary)">
            Add delicious dishes from your favorite restaurant to get started
          </p>
        </div>
        <Link
          to="/order-now"
          className="px-6 py-2.5 bg-(--color-primary) text-(--color-primary-content) rounded-xl font-semibold text-sm hover:opacity-90 transition shadow-sm"
        >
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-base-200)">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-(--color-base-300) transition text-(--color-base-content)"
          >
            <IoArrowBack className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-(--color-base-content) flex items-center gap-2">
              <IoCartOutline />
              Your Cart
            </h1>
            <p className="text-sm text-(--color-secondary) flex items-center gap-1 mt-0.5">
              <IoStorefrontOutline />
              Ordering from: <span className="font-semibold">{cart.restaurantName || "Restaurant"}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Left Column: Cart items & Delivery Address */}
          <div className="space-y-6">
            {/* Cart Items Card */}
            <div className="bg-(--color-base-100) rounded-xl p-5 border border-(--color-base-300) shadow-xs space-y-4">
              <h2 className="text-base font-bold flex justify-between items-center">
                <span>Selected Items ({totalItems})</span>
                <button
                  onClick={clearCart}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1 font-normal"
                >
                  <IoTrashOutline /> Clear Cart
                </button>
              </h2>

              <div className="divide-y divide-(--color-base-200)">
                {cart.items.map((item) => (
                  <div
                    key={item._id}
                    className="py-3 flex gap-4 items-center first:pt-0 last:pb-0"
                  >
                    {/* Item Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-(--color-base-300)">
                      {item.image?.url ? (
                        <img
                          src={item.image.url}
                          alt={item.itemName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MdOutlineRestaurantMenu className="text-2xl text-(--color-secondary) opacity-40" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full border border-white shrink-0 ${foodTypeDot(
                            item.foodType,
                          )}`}
                        />
                        <h3 className="text-sm font-semibold text-(--color-base-content) truncate">
                          {item.itemName}
                        </h3>
                      </div>
                      <p className="text-xs text-(--color-secondary) mb-1">
                        {item.category}
                      </p>
                      <p className="text-sm font-bold text-(--color-primary)">
                        ₹{(item.price * item.quantity).toFixed(2)}
                        <span className="ml-1 text-xs font-normal text-(--color-secondary)">
                          (₹{item.price} each)
                        </span>
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-(--color-base-300) rounded-full divide-(--color-base-300) divide-x">
                        <button
                          onClick={() => decreaseItem(item._id)}
                          className="px-2 py-1 text-(--color-primary) rounded-l-full hover:bg-(--color-primary) hover:text-(--color-primary-content) transition"
                        >
                          <IoIosRemoveCircleOutline className="text-xl" />
                        </button>
                        <div className="text-(--color-primary) flex justify-center items-center text-sm font-semibold px-2.5 py-1 min-w-7">
                          {item.quantity}
                        </div>
                        <button
                          onClick={() => increaseItem(item._id)}
                          className="px-2 py-1 text-(--color-primary) rounded-r-full hover:bg-(--color-primary) hover:text-(--color-primary-content) transition"
                        >
                          <IoIosAddCircleOutline className="text-xl" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-(--color-secondary) hover:text-red-500 transition"
                        title="Remove item"
                      >
                        <IoTrashOutline className="text-lg" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address Card */}
            <div className="bg-(--color-base-100) rounded-xl p-5 border border-(--color-base-300) shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <IoLocationOutline className="text-(--color-primary) text-lg" />
                  Delivery Address
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="text-xs text-(--color-primary) font-semibold flex items-center gap-1 hover:underline"
                >
                  <IoAddCircleOutline />
                  {showAddAddress ? "Cancel" : "+ Add New Address"}
                </button>
              </div>

              {/* Add New Address Form */}
              {showAddAddress && (
                <form
                  onSubmit={handleAddNewAddress}
                  className="mb-4 p-4 border border-(--color-primary)/30 bg-(--color-base-200)/40 rounded-xl space-y-3"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-(--color-primary)">
                    New Delivery Address
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Receiver's Full Name *"
                      value={newAddrForm.name}
                      onChange={(e) =>
                        setNewAddrForm({ ...newAddrForm, name: e.target.value })
                      }
                      className="w-full text-xs p-2 border border-(--color-base-300) rounded-md bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Street / Flat / House No *"
                      value={newAddrForm.address}
                      onChange={(e) =>
                        setNewAddrForm({ ...newAddrForm, address: e.target.value })
                      }
                      className="w-full text-xs p-2 border border-(--color-base-300) rounded-md bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="City *"
                      value={newAddrForm.city}
                      onChange={(e) =>
                        setNewAddrForm({ ...newAddrForm, city: e.target.value })
                      }
                      className="w-full text-xs p-2 border border-(--color-base-300) rounded-md bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddrForm.state}
                      onChange={(e) =>
                        setNewAddrForm({ ...newAddrForm, state: e.target.value })
                      }
                      className="w-full text-xs p-2 border border-(--color-base-300) rounded-md bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Pin Code *"
                      value={newAddrForm.pinCode}
                      onChange={(e) =>
                        setNewAddrForm({ ...newAddrForm, pinCode: e.target.value })
                      }
                      className="w-full text-xs p-2 border border-(--color-base-300) rounded-md bg-white"
                      required
                    />
                    <select
                      value={newAddrForm.addressType}
                      onChange={(e) =>
                        setNewAddrForm({ ...newAddrForm, addressType: e.target.value })
                      }
                      className="w-full text-xs p-2 border border-(--color-base-300) rounded-md bg-white"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingAddress}
                    className="px-4 py-1.5 bg-(--color-primary) text-(--color-primary-content) text-xs rounded-md font-semibold hover:opacity-90"
                  >
                    {isSavingAddress ? "Saving..." : "Save Address"}
                  </button>
                </form>
              )}

              {/* Saved Addresses List */}
              {addresses.length === 0 ? (
                <div className="text-xs text-(--color-secondary) p-3 bg-(--color-base-200) rounded-lg">
                  No saved addresses found. Click "+ Add New Address" above to enter your delivery address.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition relative ${
                          isSelected
                            ? "border-(--color-primary) bg-(--color-primary)/5 ring-1 ring-(--color-primary)"
                            : "border-(--color-base-300) hover:border-(--color-primary)/50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-sm text-(--color-base-content)">
                            {addr.name}
                          </span>
                          <span className="capitalize px-2 py-0.5 bg-(--color-base-200) rounded text-[10px] font-semibold">
                            {addr.addressType}
                          </span>
                        </div>
                        <p className="text-(--color-secondary) line-clamp-2">
                          {addr.address}, {addr.city}, {addr.state} - {addr.pinCode}
                        </p>
                        {isSelected && (
                          <span className="text-(--color-primary) flex items-center gap-1 font-semibold mt-2 text-[11px]">
                            <IoCheckmarkCircle /> Delivering here
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="bg-(--color-base-100) rounded-xl border border-(--color-base-300) p-5 sticky top-20 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-(--color-base-content)">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-(--color-secondary)">
                <span>Items Subtotal ({totalItems})</span>
                <span className="font-semibold text-sm text-(--color-base-content)">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-(--color-secondary)">
                <span>Taxes & GST (5%)</span>
                <span>₹{(totalPrice * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-(--color-secondary)">
                <span>Platform & Convenience Fee</span>
                <span>₹10.00</span>
              </div>
              <div className="flex justify-between text-(--color-secondary)">
                <span>Delivery Charge</span>
                <span className="text-green-600 font-bold uppercase">Free</span>
              </div>

              <div className="border-t border-(--color-base-300) pt-3 mt-2 flex justify-between font-bold text-base text-(--color-base-content)">
                <span>To Pay</span>
                <span className="text-(--color-primary)">
                  ₹{(totalPrice + totalPrice * 0.05 + 10).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              disabled={isPlacingOrder}
              className="w-full py-3 bg-(--color-primary) text-(--color-primary-content) rounded-xl font-bold text-sm hover:opacity-90 transition shadow-sm disabled:opacity-50"
              onClick={handlePlaceOrder}
            >
              {isPlacingOrder ? "Processing Payment..." : "Proceed to Pay via Razorpay"}
            </button>

            <Link
              to={`/restaurant-details/${cart.restaurantId}`}
              className="flex items-center justify-center gap-1 text-xs text-(--color-primary) hover:underline font-semibold"
            >
              <IoStorefrontOutline />
              Add more items from this restaurant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
