import { db } from "../config/db.js";

// ✅ Create a new admission (Admin/Institution only)
export const createAdmission = async (req, res) => {
  try {
    const { applicationId, admissionStatus, remarks } = req.body;
    if (!applicationId || !admissionStatus) {
      return res.status(400).json({ message: "applicationId and admissionStatus are required" });
    }

    const appDoc = await db.collection("applications").doc(applicationId).get();
    if (!appDoc.exists) return res.status(404).json({ message: "Application not found" });

    const appData = appDoc.data();

    const newAdmissionRef = await db.collection("admissions").add({
      applicationId,
      studentId: appData.studentId,
      courseId: appData.courseId,
      facultyId: appData.facultyId,
      institutionId: appData.institutionId,
      admissionStatus,
      remarks: remarks || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      status: "success",
      admission: { id: newAdmissionRef.id, ...appData, admissionStatus, remarks: remarks || "" },
    });
  } catch (err) {
    console.error("Create admission error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get admissions (dynamic: /me for students, institution or all for admin)
export const getAdmissions = async (req, res) => {
  try {
    let snap;

    if (req.user.role === "student") {
      const profileSnap = await db.collection("studentProfiles")
                                  .where("userId", "==", req.user.id)
                                  .limit(1)
                                  .get();
      if (profileSnap.empty) return res.status(404).json({ message: "Student profile not found" });
      const studentId = profileSnap.docs[0].id;

      snap = await db.collection("admissions").where("studentId", "==", studentId).get();

    } else if (req.user.role === "institution") {
      const profileSnap = await db.collection("institutionProfiles")
                                  .where("userId", "==", req.user.id)
                                  .limit(1)
                                  .get();
      if (profileSnap.empty) return res.status(404).json({ message: "Institution profile not found" });
      const institutionId = profileSnap.docs[0].id;

      snap = await db.collection("admissions").where("institutionId", "==", institutionId).get();

    } else if (req.user.role === "admin") {
      snap = await db.collection("admissions").get();
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    if (snap.empty) return res.status(404).json({ message: "No admissions found" });

    const admissions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", admissions });

  } catch (err) {
    console.error("Get admissions error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get admission by ID
export const getAdmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("admissions").doc(id).get();
    if (!doc.exists) return res.status(404).json({ message: "Admission not found" });
    res.json({ status: "success", admission: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error("Get admission by ID error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update admission (Admin/Institution only)
export const updateAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };

    await db.collection("admissions").doc(id).update(updates);
    const updatedDoc = await db.collection("admissions").doc(id).get();

    res.json({ status: "success", admission: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    console.error("Update admission error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete admission (Admin/Institution only)
export const deleteAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("admissions").doc(id).delete();
    res.json({ status: "success", message: "Admission deleted successfully" });
  } catch (err) {
    console.error("Delete admission error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
