import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createJob, getJobs, getJobById, updateJob, deleteJob } from "../controllers/jobController.js";

const router = express.Router();
router.use(protect);

// Company-only jobs for /me
router.get("/me", getJobs);

// CRUD endpoints
router.post("/", createJob);
router.get("/", getJobs);        // admin gets all, company gets theirs
router.get("/:id", getJobById);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

export default router;
