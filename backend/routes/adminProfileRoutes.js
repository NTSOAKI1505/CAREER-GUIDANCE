import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createAdminProfile,
  getAllAdminProfiles,
  getAdminProfileById,
  updateAdminProfile,
  deleteAdminProfile,
  getProfileForCurrentUser,
} from "../controllers/adminProfileController.js";

const router = express.Router();

// ✅ Protect all routes
router.use(protect);

// Create new admin profile
router.post("/", createAdminProfile);

// Get all admin profiles (admin/general)
router.get("/", getAllAdminProfiles);

// Get logged-in user's profile
router.get("/me", getProfileForCurrentUser);

// Get profile by ID
router.get("/:id", getAdminProfileById);

// Update profile by ID
router.put("/:id", updateAdminProfile);

// Delete profile by ID
router.delete("/:id", deleteAdminProfile);

export default router;
