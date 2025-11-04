import { db } from "../config/db.js"; // Firestore connection

// ✅ Create Faculty (linked to InstitutionProfile)
export const createFaculty = async (req, res) => {
  try {
    const {
      institutionId,
      facultyName,
      description,
      deanName,
      contactEmail,
      contactPhone,
      establishedYear,
      website,
    } = req.body;

    if (!institutionId || !facultyName) {
      return res.status(400).json({ message: "institutionId and facultyName are required" });
    }

    const institutionDoc = await db.collection("institutionProfiles").doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const institutionData = institutionDoc.data();

    const newFacultyRef = await db.collection("faculties").add({
      institutionId,
      institutionInfo: {
        institutionName: institutionData.institutionName,
        location: institutionData.location,
        type: institutionData.type,
        contactEmail: institutionData.contactEmail,
        contactPhone: institutionData.contactPhone,
      },
      facultyName,
      description: description || "",
      deanName: deanName || "",
      contactEmail: contactEmail || "",
      contactPhone: contactPhone || "",
      establishedYear: establishedYear || null,
      website: website || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      status: "success",
      faculty: {
        id: newFacultyRef.id,
        institutionId,
        institutionInfo: {
          institutionName: institutionData.institutionName,
          location: institutionData.location,
          type: institutionData.type,
        },
        facultyName,
        description,
        deanName,
        contactEmail,
        contactPhone,
        establishedYear,
        website,
      },
    });
  } catch (err) {
    console.error("Create faculty error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all faculties (admin/general)
export const getAllFaculties = async (req, res) => {
  try {
    const facultiesSnap = await db.collection("faculties").get();
    const faculties = facultiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", faculties });
  } catch (err) {
    console.error("Get all faculties error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all faculties for a specific institution
export const getFacultiesByInstitution = async (req, res) => {
  try {
    const { institutionId } = req.params;
    if (!institutionId) return res.status(400).json({ message: "institutionId is required" });

    const facultiesSnap = await db
      .collection("faculties")
      .where("institutionId", "==", institutionId)
      .get();

    const faculties = facultiesSnap.empty ? [] : facultiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", faculties });
  } catch (err) {
    console.error("Get faculties error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get faculty by ID
export const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;
    const facultyDoc = await db.collection("faculties").doc(id).get();
    if (!facultyDoc.exists) return res.status(404).json({ message: "Faculty not found" });

    res.json({ status: "success", faculty: { id: facultyDoc.id, ...facultyDoc.data() } });
  } catch (err) {
    console.error("Get faculty error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update faculty
export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };

    await db.collection("faculties").doc(id).update(updates);
    const updatedDoc = await db.collection("faculties").doc(id).get();

    res.json({ status: "success", faculty: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    console.error("Update faculty error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete faculty
export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("faculties").doc(id).delete();
    res.json({ status: "success", message: "Faculty deleted successfully" });
  } catch (err) {
    console.error("Delete faculty error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
