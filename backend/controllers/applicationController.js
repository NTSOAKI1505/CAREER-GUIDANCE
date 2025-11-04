import { db } from "../config/db.js";

// ✅ Create a new application
export const createApplication = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId) {
      return res.status(400).json({ message: "studentId and courseId are required" });
    }

    const courseDoc = await db.collection("courses").doc(courseId).get();
    if (!courseDoc.exists) return res.status(404).json({ message: "Course not found" });

    const courseData = courseDoc.data();
    if (!courseData.facultyId || !courseData.institutionId) {
      return res.status(500).json({ message: "Course missing facultyId or institutionId" });
    }

    const newAppRef = await db.collection("applications").add({
      studentId,                                // Reference to StudentProfile
      courseId,                                 // Reference to Course
      facultyId: courseData.facultyId,          // Reference to Faculty
      institutionId: courseData.institutionId,  // Reference to InstitutionProfile
      applicationDate: new Date(),
      status: "Pending",
      remarks: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      status: "success",
      application: {
        id: newAppRef.id,
        studentId,
        courseId,
        facultyId: courseData.facultyId,
        institutionId: courseData.institutionId,
        status: "Pending",
      },
    });
  } catch (err) {
    console.error("Create application error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all applications
export const getAllApplications = async (req, res) => {
  try {
    const snap = await db.collection("applications").get();
    const applications = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", applications });
  } catch (err) {
    console.error("Get applications error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const docSnap = await db.collection("applications").doc(id).get();
    if (!docSnap.exists) return res.status(404).json({ message: "Application not found" });
    res.json({ status: "success", application: { id: docSnap.id, ...docSnap.data() } });
  } catch (err) {
    console.error("Get application error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get applications by student
export const getApplicationsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const snap = await db.collection("applications").where("studentId", "==", studentId).get();
    const applications = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", applications });
  } catch (err) {
    console.error("Get applications by student error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get applications by institution
export const getApplicationsByInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const snap = await db.collection("applications").where("institutionId", "==", institutionId).get();
    const applications = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", applications });
  } catch (err) {
    console.error("Get applications by institution error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update application
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };
    await db.collection("applications").doc(id).update(updates);
    const updatedDoc = await db.collection("applications").doc(id).get();
    res.json({ status: "success", application: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    console.error("Update application error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete application
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("applications").doc(id).delete();
    res.json({ status: "success", message: "Application deleted successfully" });
  } catch (err) {
    console.error("Delete application error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
