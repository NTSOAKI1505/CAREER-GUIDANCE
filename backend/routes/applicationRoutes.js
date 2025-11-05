// routes/applicationRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createApplication,
  getAllApplications,
  getApplicationById,
  getMyApplications, // unified for student & institution
  updateApplication,
  deleteApplication,
} from "../controllers/applicationController.js";

const router = express.Router();
router.use(protect);

// Student creates a new application
router.post("/", createApplication);

// Get applications for logged-in user (student or institution)
router.get("/me", getMyApplications);

// Admin/institution: get all applications (optional, for full list)
router.get("/", getAllApplications);

// Get a single application by ID
router.get("/:id", getApplicationById);

// Update application
router.put("/:id", updateApplication);

// Delete application
router.delete("/:id", deleteApplication);

export default router;
