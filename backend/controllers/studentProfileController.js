// controllers/studentProfileController.js
import { db } from "../config/db.js"; // Firestore connection

// ✅ Create Student Profile (linked to User)
export const createStudentProfile = async (req, res) => {
  try {
    const { userId, institution, course, yearOfStudy, bio, skills, resumeUrl, profilePic } = req.body;

    if (!userId || !institution || !course || !yearOfStudy) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // 🔍 Check if user exists
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userDoc.data();

    // 🚫 Check if this user already has a profile
    const existingProfileSnap = await db.collection("studentProfiles").where("userId", "==", userId).get();
    if (!existingProfileSnap.empty) {
      return res.status(400).json({ message: "Profile already exists for this user" });
    }

    // ✅ Create new student profile (auto-linked to user)
    const newProfileRef = await db.collection("studentProfiles").add({
      userId,
      userInfo: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
      },
      institution,
      course,
      yearOfStudy,
      bio: bio || "",
      skills: skills || [],
      resumeUrl: resumeUrl || "",
      profilePic: profilePic || "",
      createdAt: new Date(),
      editedAt: new Date(),
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
        institution,
        course,
        yearOfStudy,
        bio,
        skills,
        resumeUrl,
        profilePic,
      },
    });
  } catch (err) {
    console.error("Create profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all student profiles
export const getAllStudentProfiles = async (req, res) => {
  try {
    const profilesSnap = await db.collection("studentProfiles").get();
    const profiles = profilesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", profiles });
  } catch (err) {
    console.error("Get profiles error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get student profile by ID
export const getStudentProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const profileDoc = await db.collection("studentProfiles").doc(id).get();
    if (!profileDoc.exists) return res.status(404).json({ message: "Profile not found" });

    res.json({ status: "success", profile: { id: profileDoc.id, ...profileDoc.data() } });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Update student profile
export const updateStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, editedAt: new Date() };

    await db.collection("studentProfiles").doc(id).update(updates);
    const updatedDoc = await db.collection("studentProfiles").doc(id).get();

    res.json({ status: "success", profile: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Delete student profile
export const deleteStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("studentProfiles").doc(id).delete();
    res.json({ status: "success", message: "Profile deleted successfully" });
  } catch (err) {
    console.error("Delete profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
