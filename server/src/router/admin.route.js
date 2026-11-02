import express from "express";
import { AdminAuthProtect } from "../middleware/auth.middelware.js";
import {
  GetAdminOverview,
  GetAllRestaurantsAdmin,
  UpdateRestaurantStatusAdmin,
  GetAllRidersAdmin,
  UpdateRiderStatusAdmin,
  GetAllOrdersAdmin,
  GetContactMessagesAdmin,
} from "../controller/admin.controller.js";

const router = express.Router();

router.get("/overview", AdminAuthProtect, GetAdminOverview);
router.get("/restaurants", AdminAuthProtect, GetAllRestaurantsAdmin);
router.patch("/restaurant/:restaurantId/status", AdminAuthProtect, UpdateRestaurantStatusAdmin);

router.get("/riders", AdminAuthProtect, GetAllRidersAdmin);
router.patch("/rider/:riderId/status", AdminAuthProtect, UpdateRiderStatusAdmin);

router.get("/orders", AdminAuthProtect, GetAllOrdersAdmin);
router.get("/contact-messages", AdminAuthProtect, GetContactMessagesAdmin);

export default router;
