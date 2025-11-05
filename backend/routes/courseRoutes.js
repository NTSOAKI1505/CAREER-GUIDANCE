import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCoursesByFaculty,
} from "../controllers/courseController.js"; // <- correct path

const router = express.Router();
router.use(protect);

router.post("/", createCourse);
router.get("/", getAllCourses);
router.get("/faculty/:facultyId", getCoursesByFaculty);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export default router;
