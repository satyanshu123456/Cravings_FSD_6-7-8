import dotenv from "dotenv";
dotenv.config();

import cloudinary from "./src/config/cloudinary.config.js";
import express from "express";
import connectDB from "./src/config/dbConnection.config.js";
import AuthRouter from "./src/router/auth.route.js";
import PublicRouter from "./src/router/public.route.js";
import CommonRouter from "./src/router/common.route.js";
import AdminRouter from "./src/router/admin.route.js";
import RestaurantRouter from "./src/router/restaurant.route.js";
import CustomerRouter from "./src/router/customer.route.js";
import RiderRouter from "./src/router/rider.route.js";
import OrderRouter from "./src/router/order.route.js";
import PaymentRouter from "./src/router/payment.route.js";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Trust reverse proxy (Render, Railway, Vercel, Heroku) for secure cookies over HTTPS
app.set("trust proxy", 1);

const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, "") : "http://localhost:5173";
const allowedOrigins = [clientUrl, "http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(cleanOrigin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(null, cleanOrigin);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use(morgan("dev"));

app.use("/auth", AuthRouter);
app.use("/public", PublicRouter);
app.use("/common", CommonRouter);

app.use("/admin", AdminRouter);
app.use("/restaurant", RestaurantRouter);
app.use("/customer", CustomerRouter);
app.use("/rider", RiderRouter);
app.use("/order", OrderRouter);
app.use("/payment", PaymentRouter);

//Default API
app.get("/", (req, res) => {
  console.log("Default Get API Hit");
  res.json({ message: "Welcome to my Cravings Project" });
});

//Default Error Handler
app.use((err, req, res, next) => {
  const ErrMessage = err.message || "Internal Server Error";
  const ErrStausCode = err.statusCode || 500;

  res.status(ErrStausCode).json({ message: ErrMessage });
});

const port = process.env.PORT || 5000;

app.listen(port, async () => {
  console.log("Server Started on port:", port);
  connectDB();
  try {
    const result = await cloudinary.api.ping();
    console.log("Cloudinary Connected :");
    console.log(result);
  } catch (error) {
    console.log("Cloudinary connection warning:", error.message);
  }
});
