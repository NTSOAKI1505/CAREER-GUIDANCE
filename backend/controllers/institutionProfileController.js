import { db } from "../config/db.js"; // Firestore connection

// ✅ Create Institution Profile (linked to User)
export const createInstitutionProfile = async (req, res) => {
  try {
    const {
      userId,
      institutionName,
      location,
      type,
      description,
      website,
      logoUrl,
      contactEmail,
      contactPhone,
    } = req.body;

    if (!userId || !institutionName || !location || !type) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // 🔍 Check if user exists
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userDoc.data();

    // 🚫 Check if this user already has an institution profile
    const existingProfileSnap = await db
      .collection("institutionProfiles")
      .where("userId", "==", userId)
      .get();
    if (!existingProfileSnap.empty) {
      return res.status(400).json({ message: "Profile already exists for this user" });
    }

    // ✅ Create new institution profile
    const newProfileRef = await db.collection("institutionProfiles").add({
      userId,
      userInfo: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
      },
      institutionName,
      location,
      type,
      description: description || "",
      website: website || "",
      logoUrl: logoUrl || "",
      contactEmail: contactEmail || "",
      contactPhone: contactPhone || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      status: "success",
      profile: {
        id: newProfileRef.id,
        userId,
        userInfo: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
        },
        institutionName,
        location,
        type,
        description,
        website,
        logoUrl,
        contactEmail,
        contactPhone,
      },
    });
  } catch (err) {
    console.error("Create institution profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get profile for currently logged-in user
export const getProfileForCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id; // from authMiddleware

    const profileSnap = await db
      .collection("institutionProfiles")
      .where("userId", "==", userId)
      .get();

    if (profileSnap.empty) {
      return res.json({ status: "success", profiles: [] });
    }

    const profiles = profileSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", profiles });
  } catch (err) {
    console.error("Get profile for current user error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all institution profiles (admin/general)
export const getAllInstitutionProfiles = async (req, res) => {
  try {
    const profilesSnap = await db.collection("institutionProfiles").get();
    const profiles = profilesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", profiles });
  } catch (err) {
    console.error("Get profiles error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get institution profile by ID
export const getInstitutionProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const profileDoc = await db.collection("institutionProfiles").doc(id).get();
    if (!profileDoc.exists) return res.status(404).json({ message: "Profile not found" });

    res.json({ status: "success", profile: { id: profileDoc.id, ...profileDoc.data() } });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update institution profile
export const updateInstitutionProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };

    await db.collection("institutionProfiles").doc(id).update(updates);
    const updatedDoc = await db.collection("institutionProfiles").doc(id).get();

    res.json({ status: "success", profile: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete institution profile
export const deleteInstitutionProfile = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("institutionProfiles").doc(id).delete();
    res.json({ status: "success", message: "Profile deleted successfully" });
  } catch (err) {
    console.error("Delete profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
