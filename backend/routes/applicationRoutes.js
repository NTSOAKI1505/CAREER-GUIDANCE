// routes/applicationRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createApplication,
  getAllApplications,
  getApplicationById,
  getApplicationsByStudent, // now uses logged-in student's profile
  getApplicationsByInstitution,
  updateApplication,
  deleteApplication,
} from "../controllers/applicationController.js";

const router = express.Router();
router.use(protect);

// CRUD routes
router.post("/", createApplication);
router.get("/", getAllApplications);
router.get("/me", getApplicationsByStudent); // student sees only their applications
router.get("/institution/:institutionId", getApplicationsByInstitution);
router.get("/:id", getApplicationById);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

export default router;
