import { db } from "../config/db.js";

// ✅ Create a new application (student only)
export const createApplication = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    // Get the student's profile
    const profileSnap = await db.collection("studentProfiles")
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (profileSnap.empty) return res.status(404).json({ message: "Student profile not found" });

    const studentProfile = profileSnap.docs[0].data();
    const studentProfileId = profileSnap.docs[0].id;

    // Get the course info
    const courseDoc = await db.collection("courses").doc(courseId).get();
    if (!courseDoc.exists) return res.status(404).json({ message: "Course not found" });

    const courseData = courseDoc.data();
    if (!courseData.facultyId || !courseData.institutionId) {
      return res.status(500).json({ message: "Course missing facultyId or institutionId" });
    }

    // Create application
    const newAppRef = await db.collection("applications").add({
      studentId: studentProfileId,
      courseId,
      facultyId: courseData.facultyId,
      institutionId: courseData.institutionId,
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
        studentId: studentProfileId,
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

// ✅ Get applications for logged-in student or institution
export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role; // "student" or "institution"

    let query;
    if (role === "student") {
      const profileSnap = await db.collection("studentProfiles")
        .where("userId", "==", userId)
        .limit(1)
        .get();

      if (profileSnap.empty) return res.status(404).json({ message: "Student profile not found" });

      const studentId = profileSnap.docs[0].id;
      query = db.collection("applications").where("studentId", "==", studentId);

    } else if (role === "institution") {
      const profileSnap = await db.collection("institutionProfiles")
        .where("userId", "==", userId)
        .limit(1)
        .get();

      if (profileSnap.empty) return res.status(404).json({ message: "Institution profile not found" });

      const institutionId = profileSnap.docs[0].id;
      query = db.collection("applications").where("institutionId", "==", institutionId);

    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const snap = await query.get();
    if (snap.empty) return res.status(404).json({ message: "No applications found" });

    const applications = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", applications });

  } catch (err) {
    console.error("Get my applications error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Other CRUD operations (unchanged)
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
