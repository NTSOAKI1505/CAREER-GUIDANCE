import { db } from "../config/db.js"; // Firestore connection

// ✅ Create Company Profile
export const createCompanyProfile = async (req, res) => {
  try {
    const {
      userId,
      companyName,
      location,
      industry,
      description,
      website,
      logoUrl,
      contactEmail,
      contactPhone,
    } = req.body;

    if (!userId || !companyName || !location || !industry) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // 🔍 Check if user exists
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }
    const userData = userDoc.data();

    // 🚫 Check if company profile already exists for this user
    const existingProfileSnap = await db
      .collection("companyProfiles")
      .where("userId", "==", userId)
      .get();
    if (!existingProfileSnap.empty) {
      return res.status(400).json({ message: "Profile already exists for this user" });
    }

    // ✅ Create new profile
    const newProfileRef = await db.collection("companyProfiles").add({
      userId,
      userInfo: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
      },
      companyName,
      location,
      industry,
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
        companyName,
        location,
        industry,
        description,
        website,
        logoUrl,
        contactEmail,
        contactPhone,
      },
    });
  } catch (err) {
    console.error("Create company profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get current user's company profile
export const getProfileForCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const profileSnap = await db
      .collection("companyProfiles")
      .where("userId", "==", userId)
      .get();

    if (profileSnap.empty) return res.json({ status: "success", profiles: [] });

    const profiles = profileSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", profiles });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all company profiles (admin/general)
export const getAllCompanyProfiles = async (req, res) => {
  try {
    const profilesSnap = await db.collection("companyProfiles").get();
    const profiles = profilesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", profiles });
  } catch (err) {
    console.error("Get all profiles error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get company profile by ID
export const getCompanyProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const profileDoc = await db.collection("companyProfiles").doc(id).get();
    if (!profileDoc.exists) return res.status(404).json({ message: "Profile not found" });

    res.json({ status: "success", profile: { id: profileDoc.id, ...profileDoc.data() } });
  } catch (err) {
    console.error("Get profile by ID error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update company profile
export const updateCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };

    await db.collection("companyProfiles").doc(id).update(updates);
    const updatedDoc = await db.collection("companyProfiles").doc(id).get();

    res.json({ status: "success", profile: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete company profile
export const deleteCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    await db. collection("companyProfiles").doc(id).delete();
    res.json({ status: "success", message: "Profile deleted successfully" });
  } catch (err) {
    console.error("Delete profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
