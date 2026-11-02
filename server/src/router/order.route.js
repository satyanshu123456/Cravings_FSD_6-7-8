import express from "express";
import { AuthProtect } from "../middleware/auth.middelware.js";
import {
  CreateOrder,
  GetOrderDetails,
  RateOrder,
} from "../controller/order.controller.js";

const router = express.Router();

router.post("/create", AuthProtect, CreateOrder);
router.get("/:orderId", AuthProtect, GetOrderDetails);
router.post("/:orderId/rate", AuthProtect, RateOrder);

export default router;
