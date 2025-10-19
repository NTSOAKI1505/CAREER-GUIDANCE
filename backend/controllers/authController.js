// controllers/authController.js
import { db } from "../config/db.js"; // Firestore db connection
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const signToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/**
 * SIGNUP
 */
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, passwordConfirm, role } = req.body;

    if (!firstName || !lastName || !email || !password || !passwordConfirm) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: "Passwords do not match" });
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
      role: role || "student",
      createdAt: new Date(),
    });

    const token = signToken(newUserRef.id, role || "student");

    res.status(201).json({
      status: "success",
      token,
      user: {
        id: newUserRef.id,
        firstName,
        lastName,
        email,
        role: role || "student",
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const userSnap = await db.collection("users").where("email", "==", email).get();
    if (userSnap.empty) return res.status(404).json({ message: "User not found" });

    const userDoc = userSnap.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user.id, user.role);

    res.json({
      status: "success",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * GET CURRENT LOGGED-IN USER
 */
export const getCurrentUser = async (req, res) => {
  try {
    // req.user will be set in your authMiddleware
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    res.json({ user: req.user });
  } catch (err) {
    console.error("GetCurrentUser error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
