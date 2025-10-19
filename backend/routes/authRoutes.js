// routes/authRoutes.js
import express from "express";
import { signup, login, getCurrentUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: Register new user
router.post("/signup", signup);

// Public: Login user
router.post("/login", login);

// Protected: Get current logged-in user
router.get("/me", protect, getCurrentUser);

export default router;
