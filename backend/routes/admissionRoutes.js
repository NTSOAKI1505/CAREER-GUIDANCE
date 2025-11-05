import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createAdmission,
  getAdmissions,
  getAdmissionById,
  updateAdmission,
  deleteAdmission,
} from "../controllers/admissionController.js";

const router = express.Router();
router.use(protect);

// /me is now dynamic inside getAdmissions
router.get("/me", getAdmissions);

// CRUD endpoints
router.post("/", createAdmission);
router.get("/", getAdmissions);
router.get("/:id", getAdmissionById);
router.put("/:id", updateAdmission);
router.delete("/:id", deleteAdmission);

export default router;
