import { db } from "../config/db.js";

// ✅ Create a Course (linked to a Faculty and Institution)
export const createCourse = async (req, res) => {
  try {
    const { facultyId, institutionId, courseName, description, courseCode, credits, duration } = req.body;

    if (!facultyId || !institutionId || !courseName) {
      return res.status(400).json({ message: "facultyId, institutionId, and courseName are required" });
    }

    // Validate faculty
    const facultyDoc = await db.collection("faculties").doc(facultyId).get();
    if (!facultyDoc.exists) return res.status(404).json({ message: "Faculty not found" });

    // Validate institution
    const institutionDoc = await db.collection("institutions").doc(institutionId).get();
    if (!institutionDoc.exists) return res.status(404).json({ message: "Institution not found" });

    const facultyData = facultyDoc.data();
    const institutionData = institutionDoc.data();

    const newCourseRef = await db.collection("courses").add({
      facultyId,
      institutionId,
      facultyInfo: { facultyName: facultyData.facultyName, deanName: facultyData.deanName },
      institutionInfo: { institutionName: institutionData.name },
      courseName,
      description: description || "",
      courseCode: courseCode || "",
      credits: credits || null,
      duration: duration || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      status: "success",
      course: {
        id: newCourseRef.id,
        facultyId,
        institutionId,
        facultyInfo: { facultyName: facultyData.facultyName, deanName: facultyData.deanName },
        institutionInfo: { institutionName: institutionData.name },
        courseName,
        description,
        courseCode,
        credits,
        duration,
      },
    });
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const coursesSnap = await db.collection("courses").get();
    const courses = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", courses });
  } catch (err) {
    console.error("Get all courses error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get courses by faculty
export const getCoursesByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const coursesSnap = await db.collection("courses").where("facultyId", "==", facultyId).get();
    const courses = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", courses });
  } catch (err) {
    console.error("Get courses by faculty error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDoc = await db.collection("courses").doc(id).get();
    if (!courseDoc.exists) return res.status(404).json({ message: "Course not found" });
    res.json({ status: "success", course: { id: courseDoc.id, ...courseDoc.data() } });
  } catch (err) {
    console.error("Get course by ID error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };
    await db.collection("courses").doc(id).update(updates);
    const updatedDoc = await db.collection("courses").doc(id).get();
    res.json({ status: "success", course: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("courses").doc(id).delete();
    res.json({ status: "success", message: "Course deleted successfully" });
  } catch (err) {
    console.error("Delete course error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
