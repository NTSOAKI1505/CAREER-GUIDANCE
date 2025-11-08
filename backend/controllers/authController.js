// controllers/authController.js
import { db } from "../config/db.js"; // Firestore db connection
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

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
      passwordResetToken: null,
      passwordResetExpires: null,
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
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    res.json({ user: req.user });
  } catch (err) {
    console.error("GetCurrentUser error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * CHANGE PASSWORD
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({ status: "fail", message: "All fields are required" });
    }

    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({ status: "fail", message: "New passwords do not match" });
    }

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return res.status(404).json({ status: "fail", message: "User not found" });

    const user = userDoc.data();
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ status: "fail", message: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.collection("users").doc(userId).update({ password: hashedPassword });

    res.status(200).json({ status: "success", message: "Password updated successfully" });
  } catch (err) {
    console.error("ChangePassword error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

/**
 * FORGOT PASSWORD - send email with reset link
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: "fail", message: "Email is required" });

    const userSnap = await db.collection("users").where("email", "==", email).get();
    if (userSnap.empty) return res.status(404).json({ status: "fail", message: "User not found" });

    const userDoc = userSnap.docs[0];
    const userId = userDoc.id;

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await db.collection("users").doc(userId).update({
      passwordResetToken: hashedToken,
      passwordResetExpires: expires,
    });

    const resetURL = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const info = await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to: userDoc.data().email,
      subject: "Password Reset Request",
      html: `<p>Hello ${userDoc.data().firstName},</p>
             <p>You requested a password reset. Click the link below to reset your password. This link expires in 10 minutes.</p>
             <p><a href="${resetURL}">Reset Password</a></p>
             <p>If you did not request this, please ignore this email.</p>`,
    });

    if (info.accepted && info.accepted.length > 0) {
      return res.status(200).json({
        status: "success",
        message: `Reset link sent successfully to ${userDoc.data().email}`,
      });
    } else {
      return res.status(500).json({
        status: "fail",
        message: "Email could not be sent. Please try again later.",
      });
    }
  } catch (err) {
    console.error("ForgotPassword error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

/**
 * RESET PASSWORD
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, newPasswordConfirm } = req.body;

    if (!token || !newPassword || !newPasswordConfirm)
      return res.status(400).json({ status: "fail", message: "All fields are required" });

    if (newPassword !== newPasswordConfirm)
      return res.status(400).json({ status: "fail", message: "Passwords do not match" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const userSnap = await db.collection("users").where("passwordResetToken", "==", hashedToken).get();
    if (userSnap.empty) return res.status(400).json({ status: "fail", message: "Invalid or expired token" });

    const userDoc = userSnap.docs[0];
    const user = userDoc.data();

    if (user.passwordResetExpires < Date.now())
      return res.status(400).json({ status: "fail", message: "Token has expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.collection("users").doc(userDoc.id).update({
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    res.status(200).json({ status: "success", message: "Password reset successfully" });
  } catch (err) {
    console.error("ResetPassword error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
