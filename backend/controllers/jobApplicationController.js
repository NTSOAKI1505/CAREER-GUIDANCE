// controllers/jobApplicationController.js
import { db } from "../config/db.js";

// ✅ Helper: Get student profile from logged-in user
const getStudentProfile = async (userId) => {
  const profileSnap = await db.collection("studentProfiles")
                              .where("userId", "==", userId)
                              .limit(1)
                              .get();
  if (profileSnap.empty) return null;
  return {
    studentId: profileSnap.docs[0].id,
    studentData: profileSnap.docs[0].data()
  };
};

// ✅ Helper: Get companyId from logged-in user
const getCompanyId = async (userId) => {
  const profileSnap = await db.collection("companyProfiles")
                              .where("userId", "==", userId)
                              .limit(1)
                              .get();
  if (profileSnap.empty) return null;
  return {
    companyId: profileSnap.docs[0].id,
    companyData: profileSnap.docs[0].data()
  };
};

// ✅ Create a new job application (Student only)
export const createJobApplication = async (req, res) => {
  try {
    if (req.user.role !== "student") return res.status(403).json({ message: "Only students can apply" });

    const student = await getStudentProfile(req.user.id);
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: "Job ID is required" });

    const jobDoc = await db.collection("jobs").doc(jobId).get();
    if (!jobDoc.exists) return res.status(404).json({ message: "Job not found" });

    const now = new Date();
    const newAppRef = await db.collection("jobApplications").add({
      jobId,
      studentId: student.studentId,
      studentName: `${student.studentData.userInfo.firstName} ${student.studentData.userInfo.lastName}`,
      studentEmail: student.studentData.userInfo.email,
      studentSkills: student.studentData.skills || [],
      studentCourse: student.studentData.course || "",
      institutionName: student.studentData.institution || "",
      graduationYear: student.studentData.yearOfStudy || null,
      appliedAt: now,
      updatedAt: now,
      status: "pending",
    });

    res.status(201).json({
      status: "success",
      application: { id: newAppRef.id, ...req.body, studentId: student.studentId, status: "pending", appliedAt: now, updatedAt: now }
    });

  } catch (err) {
    console.error("Create job application error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get applications (student / company / admin)
export const getJobApplications = async (req, res) => {
  try {
    let snap;

    if (req.user.role === "student") {
      const student = await getStudentProfile(req.user.id);
      if (!student) return res.status(404).json({ message: "Student profile not found" });
      snap = await db.collection("jobApplications").where("studentId", "==", student.studentId).get();

    } else if (req.user.role === "company") {
      const company = await getCompanyId(req.user.id);
      if (!company) return res.status(404).json({ message: "Company profile not found" });

      const jobsSnap = await db.collection("jobs").where("companyId", "==", company.companyId).get();
      const jobIds = jobsSnap.docs.map(doc => doc.id);
      if (jobIds.length === 0) return res.status(404).json({ message: "No jobs found for your company" });

      snap = await db.collection("jobApplications").where("jobId", "in", jobIds).get();

    } else if (req.user.role === "admin") {
      snap = await db.collection("jobApplications").get();

    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    if (snap.empty) return res.status(404).json({ message: "No applications found" });
    const applications = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", applications });

  } catch (err) {
    console.error("Get job applications error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get job application by ID
export const getJobApplicationById = async (req, res) => {
  try {
    const doc = await db.collection("jobApplications").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: "Application not found" });
    res.json({ status: "success", application: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error("Get job application by ID error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update job application (company can update status)
export const updateJobApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const appDoc = await db.collection("jobApplications").doc(id).get();
    if (!appDoc.exists) return res.status(404).json({ message: "Application not found" });

    const appData = appDoc.data();

    if (req.user.role === "company") {
      const company = await getCompanyId(req.user.id);
      if (!company) return res.status(404).json({ message: "Company profile not found" });

      const jobDoc = await db.collection("jobs").doc(appData.jobId).get();
      if (!jobDoc.exists || jobDoc.data().companyId !== company.companyId)
        return res.status(403).json({ message: "Not authorized to update this application" });

      // company can only update status
      await db.collection("jobApplications").doc(id).update({ status: req.body.status, updatedAt: new Date() });

    } else if (req.user.role === "student") {
      // student can edit only some fields before review
      if (appData.studentId !== (await getStudentProfile(req.user.id)).studentId)
        return res.status(403).json({ message: "Not authorized" });

      const updates = { ...req.body, updatedAt: new Date() };
      delete updates.status; // students cannot update status
      await db.collection("jobApplications").doc(id).update(updates);

    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedDoc = await db.collection("jobApplications").doc(id).get();
    res.json({ status: "success", application: { id: updatedDoc.id, ...updatedDoc.data() } });

  } catch (err) {
    console.error("Update job application error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete job application (student or admin)
export const deleteJobApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const appDoc = await db.collection("jobApplications").doc(id).get();
    if (!appDoc.exists) return res.status(404).json({ message: "Application not found" });

    if (req.user.role === "student") {
      const student = await getStudentProfile(req.user.id);
      if (!student || appDoc.data().studentId !== student.studentId)
        return res.status(403).json({ message: "Not authorized" });

    } else if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await db.collection("jobApplications").doc(id).delete();
    res.json({ status: "success", message: "Application deleted successfully" });

  } catch (err) {
    console.error("Delete job application error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
