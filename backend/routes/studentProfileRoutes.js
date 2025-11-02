import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createStudentProfile,
  getAllStudentProfiles,
  getStudentProfileById,
  updateStudentProfile,
  deleteStudentProfile,
  getProfileForCurrentUser,
} from "../controllers/studentProfileController.js";

const router = express.Router();

// ✅ Protect all profile routes (user must be logged in)
router.use(protect);

// ✅ Create a new student profile
router.post("/", createStudentProfile);

// ✅ Get all student profiles (admin/general)
router.get("/", getAllStudentProfiles);

// ✅ Get logged-in user's own profile
router.get("/me", getProfileForCurrentUser);

// ✅ Get a specific student profile by ID
router.get("/:id", getStudentProfileById);

// ✅ Update a student profile by ID
router.put("/:id", updateStudentProfile);

// ✅ Delete a student profile by ID
router.delete("/:id", deleteStudentProfile);

export default router;
  