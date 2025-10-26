// routes/studentProfileRoutes.js
import express from "express";
import {
  createStudentProfile,
  getAllStudentProfiles,
  getStudentProfileById,
  updateStudentProfile,
  deleteStudentProfile,
} from "../controllers/studentProfileController.js";

const router = express.Router();

// Create a new student profile
router.post("/", createStudentProfile);

// Get all student profiles
router.get("/", getAllStudentProfiles);

// Get a single student profile by ID
router.get("/:id", getStudentProfileById);

// Update a student profile by ID
router.put("/:id", updateStudentProfile);

// Delete a student profile by ID
router.delete("/:id", deleteStudentProfile);

export default router;
