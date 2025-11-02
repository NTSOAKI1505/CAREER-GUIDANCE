import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createInstitutionProfile,
  getAllInstitutionProfiles,
  getInstitutionProfileById,
  updateInstitutionProfile,
  deleteInstitutionProfile,
  getProfileForCurrentUser,
} from "../controllers/institutionProfileController.js";

const router = express.Router();

// ✅ Protect all profile routes
router.use(protect);

// ✅ Create a new institution profile
router.post("/", createInstitutionProfile);

// ✅ Get all institution profiles
router.get("/", getAllInstitutionProfiles);

// ✅ Get logged-in user's own institution profile
router.get("/me", getProfileForCurrentUser);

// ✅ Get a specific institution profile by ID
router.get("/:id", getInstitutionProfileById);

// ✅ Update an institution profile by ID
router.put("/:id", updateInstitutionProfile);

// ✅ Delete an institution profile by ID
router.delete("/:id", deleteInstitutionProfile);

export default router;
