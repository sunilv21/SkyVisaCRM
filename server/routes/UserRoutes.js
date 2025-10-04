import express from "express";
import { createUser, getUsers, updateUser, deleteUser } from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, createUser);       // Admin creates users
router.get("/", protect, adminOnly, getUsers);          // Admin views users
router.put("/:id", protect, adminOnly, updateUser);     // Admin updates users
router.delete("/:id", protect, adminOnly, deleteUser);  // Admin deletes users

export default router;
