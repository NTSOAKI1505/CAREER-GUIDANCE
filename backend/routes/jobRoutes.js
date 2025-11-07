import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getCompanyJobs,
} from "../controllers/jobController.js";

const router = express.Router();

// ✅ Protect all job routes
router.use(protect);

// ✅ CRUD routes
router.post("/", createJob);                        // create
router.get("/", getAllJobs);                        // get all
router.get("/company/me", getCompanyJobs);          // get jobs for logged-in company
router.get("/:id", getJobById);                     // get by ID
router.put("/:id", updateJob);                      // update by ID
router.delete("/:id", deleteJob);                   // delete by ID

export default router;
