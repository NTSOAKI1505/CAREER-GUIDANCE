import { db } from "../config/db.js"; // Firestore connection

// ✅ Helper: get company info from logged-in user
const getCompanyProfile = async (userId) => {
  if (!userId) return null;
  const snap = await db
    .collection("companyProfiles")
    .where("userId", "==", userId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, data: snap.docs[0].data() };
};

// ✅ Create Job (linked to Company)
export const createJob = async (req, res) => {
  try {
    const company = await getCompanyProfile(req.user?.id);
    if (!company) return res.status(404).json({ message: "Company profile not found" });

    const {
      title,
      description,
      requirements,
      location,
      jobType,
      salaryRange,
      applicationDeadline,
    } = req.body;

    if (!title || !description)
      return res.status(400).json({ message: "Title and description are required" });

    const newJobRef = await db.collection("jobs").add({
      companyId: company.id,
      companyInfo: {
        companyName: company.data.companyName,
        location: company.data.location,
        type: company.data.type || "",
        contactEmail: company.data.contactEmail || "",
        contactPhone: company.data.contactPhone || "",
      },
      title,
      description,
      requirements: requirements || [],
      location: location || company.data.location,
      jobType: jobType || "Full-time",
      salaryRange: salaryRange || "",
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      status: "success",
      job: {
        id: newJobRef.id,
        companyId: company.id,
        companyInfo: {
          companyName: company.data.companyName,
          location: company.data.location,
          type: company.data.type || "",
        },
        title,
        description,
        requirements: requirements || [],
        location: location || company.data.location,
        jobType: jobType || "Full-time",
        salaryRange: salaryRange || "",
        applicationDeadline,
      },
    });
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all jobs
export const getAllJobs = async (req, res) => {
  try {
    const snap = await db.collection("jobs").get();
    const jobs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", jobs });
  } catch (err) {
    console.error("Get all jobs error:", err);
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

// ✅ Update job
export const updateJob = async (req, res) => {
  try {
    const company = await getCompanyProfile(req.user?.id);
    if (!company) return res.status(404).json({ message: "Company profile not found" });

    const jobDoc = await db.collection("jobs").doc(req.params.id).get();
    if (!jobDoc.exists) return res.status(404).json({ message: "Job not found" });
    if (jobDoc.data().companyId !== company.id)
      return res.status(403).json({ message: "Not authorized" });

    await db.collection("jobs").doc(req.params.id).update({ ...req.body, updatedAt: new Date() });
    const updatedDoc = await db.collection("jobs").doc(req.params.id).get();

    res.json({ status: "success", job: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    console.error("Update job error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete job
export const deleteJob = async (req, res) => {
  try {
    const company = await getCompanyProfile(req.user?.id);
    if (!company) return res.status(404).json({ message: "Company profile not found" });

    const jobDoc = await db.collection("jobs").doc(req.params.id).get();
    if (!jobDoc.exists) return res.status(404).json({ message: "Job not found" });
    if (jobDoc.data().companyId !== company.id)
      return res.status(403).json({ message: "Not authorized" });

    await db.collection("jobs").doc(req.params.id).delete();
    res.json({ status: "success", message: "Job deleted successfully" });
  } catch (err) {
    console.error("Delete job error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get jobs for logged-in company
export const getCompanyJobs = async (req, res) => {
  try {
    const company = await getCompanyProfile(req.user?.id);
    if (!company) return res.status(404).json({ message: "Company profile not found" });

    const snap = await db.collection("jobs").where("companyId", "==", company.id).get();
    const jobs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json({ status: "success", jobs });
  } catch (err) {
    console.error("Get company jobs error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
