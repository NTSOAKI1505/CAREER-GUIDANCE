import { db } from "../config/db.js";

// ✅ Helper: get companyId from logged-in user
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

// ✅ Create a new job
export const createJob = async (req, res) => {
  try {
    const company = await getCompanyId(req.user.id);
    if (!company) return res.status(404).json({ message: "Company profile not found" });

    const { title, description, requirements, location, jobType, salaryRange, applicationDeadline } = req.body;
    if (!title || !description) return res.status(400).json({ message: "Title and description are required" });

    const newJobRef = await db.collection("jobs").add({
      companyId: company.companyId,
      title,
      description,
      requirements: requirements || [],
      location: location || company.companyData.location,
      jobType: jobType || "Full-time",
      salaryRange: salaryRange || "",
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      status: "success",
      job: { id: newJobRef.id, companyId: company.companyId, title, description, requirements, location: location || company.companyData.location, jobType: jobType || "Full-time", salaryRange: salaryRange || "", applicationDeadline },
    });
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get jobs (company / admin)
export const getJobs = async (req, res) => {
  try {
    let snap;
    if (req.user.role === "company") {
      const company = await getCompanyId(req.user.id);
      if (!company) return res.status(404).json({ message: "Company profile not found" });
      snap = await db.collection("jobs").where("companyId", "==", company.companyId).get();
    } else if (req.user.role === "admin") {
      snap = await db.collection("jobs").get();
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    if (snap.empty) return res.status(404).json({ message: "No jobs found" });

    const jobs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", jobs });
  } catch (err) {
    console.error("Get jobs error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get job by ID
export const getJobById = async (req, res) => {
  try {
    const doc = await db.collection("jobs").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: "Job not found" });
    res.json({ status: "success", job: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error("Get job by ID error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update job (Company only)
export const updateJob = async (req, res) => {
  try {
    const company = await getCompanyId(req.user.id);
    if (!company) return res.status(404).json({ message: "Company profile not found" });

    const jobDoc = await db.collection("jobs").doc(req.params.id).get();
    if (!jobDoc.exists) return res.status(404).json({ message: "Job not found" });
    if (jobDoc.data().companyId !== company.companyId) return res.status(403).json({ message: "Not authorized" });

    await db.collection("jobs").doc(req.params.id).update({ ...req.body, updatedAt: new Date() });
    const updatedDoc = await db.collection("jobs").doc(req.params.id).get();
    res.json({ status: "success", job: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    console.error("Update job error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete job (Company only)
export const deleteJob = async (req, res) => {
  try {
    const company = await getCompanyId(req.user.id);
    if (!company) return res.status(404).json({ message: "Company profile not found" });

    const jobDoc = await db.collection("jobs").doc(req.params.id).get();
    if (!jobDoc.exists) return res.status(404).json({ message: "Job not found" });
    if (jobDoc.data().companyId !== company.companyId) return res.status(403).json({ message: "Not authorized" });

    await db.collection("jobs").doc(req.params.id).delete();
    res.json({ status: "success", message: "Job deleted successfully" });
  } catch (err) {
    console.error("Delete job error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
