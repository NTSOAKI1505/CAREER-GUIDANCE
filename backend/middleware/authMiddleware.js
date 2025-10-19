// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { db } from "../config/db.js"; // Firestore instance

// ✅ Protect routes (check if logged in)
export const protect = async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from Firestore
    const userDoc = await db.collection("users").doc(decoded.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user to request
    req.user = { id: userDoc.id, ...userDoc.data() };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// ✅ Role-based authorization (e.g. only admin can access)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission" });
    }
    next();
  };
};
