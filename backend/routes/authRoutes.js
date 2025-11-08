import express from "express";
import {
  signup,
  login,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: Register new user
router.post("/signup", signup);

// Public: Login user
router.post("/login", login);

// Protected: Get current logged-in user
router.get("/me", protect, getCurrentUser);

// Protected: Change password
router.patch("/change-password", protect, changePassword);

// Public: Forgot password (send reset token)
router.post("/forgot-password", forgotPassword);

// Public: Reset password using token
router.patch("/reset-password", resetPassword);

export default router;
