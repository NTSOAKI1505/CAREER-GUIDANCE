import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  createJob, 
  getAllJobs, 
  getCompanyJobs, 
  getJobById, 
  updateJob, 
  deleteJob 
} from "../controllers/jobController.js";

const router = express.Router();
router.use(protect);

// Company-specific jobs for logged-in company
router.get("/me", getCompanyJobs);

// CRUD endpoints
router.post("/", createJob);
router.get("/", getAllJobs);     // any logged-in user can see all jobs
router.get("/:id", getJobById);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

export default router;
