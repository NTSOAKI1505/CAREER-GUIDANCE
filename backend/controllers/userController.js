// controllers/userController.js
import { db } from "../config/db.js"; // Firestore connection
import bcrypt from "bcryptjs";

// Create user (Admin only)
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUserSnap = await db.collection("users").where("email", "==", email).get();
    if (!existingUserSnap.empty) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUserRef = await db.collection("users").add({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    });

    res.status(201).json({
      status: "success",
      user: {
        id: newUserRef.id,
        firstName,
        lastName,
        email,
        role,
      },
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const usersSnap = await db.collection("users").get();
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ status: "success", users });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await db.collection("users").doc(id).get();
    if (!userDoc.exists) return res.status(404).json({ message: "User not found" });

    res.json({ status: "success", user: { id: userDoc.id, ...userDoc.data() } });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update user by ID
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }

    await db.collection("users").doc(id).update(data);

    const updatedUser = await db.collection("users").doc(id).get();
    res.json({ status: "success", user: { id: updatedUser.id, ...updatedUser.data() } });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete user by ID
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("users").doc(id).delete();
    res.json({ status: "success", message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
