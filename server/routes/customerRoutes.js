import express from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addLogToCustomer,
  moveCustomerToTravelling,
  getAllLogs,
} from "../controllers/customerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Logs routes (must come before /:id routes)
router.get("/logs/all", protect, getAllLogs);

// Customer routes
router.post("/", protect, createCustomer);
router.get("/", protect, getCustomers);
router.get("/:id", protect, getCustomerById);
router.put("/:id", protect, updateCustomer);
router.delete("/:id", protect, deleteCustomer);
router.post("/:id/logs", protect, addLogToCustomer);
router.put("/:id/travelling", protect, moveCustomerToTravelling);

export default router;
