import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createFaculty,
  getAllFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  getFacultiesByInstitution,
} from "../controllers/facultyController.js";

const router = express.Router();

// ✅ Protect all faculty routes
router.use(protect);

// ✅ CRUD routes
router.post("/", createFaculty);                        // create
router.get("/", getAllFaculties);                       // get all
router.get("/institution/:institutionId", getFacultiesByInstitution); // get by institution
router.get("/:id", getFacultyById);                     // get by ID
router.put("/:id", updateFaculty);                      // update by ID
router.delete("/:id", deleteFaculty);                   // delete by ID

export default router;
