import express from "express";
import { AuthProtect } from "../middleware/auth.middelware.js";
import {
  GetAddressBook,
  AddAddress,
  UpdateAddress,
  DeleteAddress,
} from "../controller/customer.controller.js";

const router = express.Router();

// Address Book
router.get("/address-book", AuthProtect, GetAddressBook);
router.post("/address-book", AuthProtect, AddAddress);
router.put("/address-book/:addressId", AuthProtect, UpdateAddress);
router.delete("/address-book/:addressId", AuthProtect, DeleteAddress);

export default router;
