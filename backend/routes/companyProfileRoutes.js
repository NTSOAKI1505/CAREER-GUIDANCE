import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createCompanyProfile,
  getAllCompanyProfiles,
  getCompanyProfileById,
  updateCompanyProfile,
  deleteCompanyProfile,
  getProfileForCurrentUser,
} from "../controllers/companyProfileController.js";

const router = express.Router();

// ✅ All routes protected
router.use(protect);

// ✅ Create company profile
router.post("/", createCompanyProfile);

// ✅ Get all company profiles
router.get("/", getAllCompanyProfiles);

// ✅ Get current user's profile
router.get("/me", getProfileForCurrentUser);

// ✅ Get company profile by ID
router.get("/:id", getCompanyProfileById);

// ✅ Update company profile by ID
router.put("/:id", updateCompanyProfile);

// ✅ Delete company profile by ID
router.delete("/:id", deleteCompanyProfile);

export default router;
