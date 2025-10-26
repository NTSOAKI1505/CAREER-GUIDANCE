import 'dotenv/config';
import express from "express";
import cors from "cors";
import { db } from "./config/db.js"; // Firestore connection
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import studentProfileRoutes from "./routes/studentProfileRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/student/profile", studentProfileRoutes);

// Test route
app.get("/me", (req, res) => {
  res.send("Backend is running! ✅ Firestore connection is active.");
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
