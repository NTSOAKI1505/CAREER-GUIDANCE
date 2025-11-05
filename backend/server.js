import 'dotenv/config';
import express from "express";
import cors from "cors";
import { db } from "./config/db.js"; // Firestore connection
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import studentProfileRoutes from "./routes/studentProfileRoutes.js";
import institutionProfileRoutes from "./routes/institutionProfileRoutes.js";
import companyProfileRoutes from "./routes/companyProfileRoutes.js";
import adminProfileRoutes from "./routes/adminProfileRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js"; 
import courseRoutes from "./routes/courseRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import admissionRoutes from "./routes/admissionRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import jobApplicationRoutes from "./routes/jobApplicationRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/student/profile", studentProfileRoutes);
app.use("/api/institution/profile", institutionProfileRoutes);
app.use("/api/company/profile", companyProfileRoutes);
app.use("/api/admin/profile", adminProfileRoutes);
app.use("/api/faculty", facultyRoutes); 
app.use("/api/course", courseRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/admission", admissionRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/jobApplications", jobApplicationRoutes);

// Test route
app.get("/me", (req, res) => {
  res.send("Backend is running! ✅ Firestore connection is active.");
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
