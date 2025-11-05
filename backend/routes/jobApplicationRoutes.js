// routes/jobApplicationRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createJobApplication,
  getJobApplications,
  getJobApplicationById,
  updateJobApplication,
  deleteJobApplication,
} from "../controllers/jobApplicationController.js";

const router = express.Router();
router.use(protect);

// Student: get their own applications
router.get("/me", getJobApplications);

// Company: view all applications for jobs they posted
router.get("/company/me", getJobApplications);

// Admin / Company / Student: CRUD and get applications
router.post("/", createJobApplication);
router.get("/", getJobApplications);
router.get("/:id", getJobApplicationById);
router.put("/:id", updateJobApplication);
router.delete("/:id", deleteJobApplication);

export default router;
