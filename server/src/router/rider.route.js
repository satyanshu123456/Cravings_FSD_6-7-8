import express from "express";
import { RiderAuthProtect } from "../middleware/auth.middelware.js";
import {
  GetRiderProfile,
  UpdateRiderProfile,
  ToggleRiderAvailability,
  GetAvailableDeliveries,
  AcceptDelivery,
  GetMyDeliveries,
  UpdateDeliveryStatus,
  GetRiderOverview,
} from "../controller/rider.controller.js";

const router = express.Router();

router.get("/profile", RiderAuthProtect, GetRiderProfile);
router.put("/profile", RiderAuthProtect, UpdateRiderProfile);
router.patch("/toggle-availability", RiderAuthProtect, ToggleRiderAvailability);

router.get("/available-deliveries", RiderAuthProtect, GetAvailableDeliveries);
router.post("/accept-order/:orderId", RiderAuthProtect, AcceptDelivery);

router.get("/my-deliveries", RiderAuthProtect, GetMyDeliveries);
router.patch("/update-status/:orderId", RiderAuthProtect, UpdateDeliveryStatus);

router.get("/overview", RiderAuthProtect, GetRiderOverview);

export default router;
