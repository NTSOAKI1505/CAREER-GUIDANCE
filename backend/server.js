// backend/server.js
import express from "express";
import cors from "cors";
import { db } from "./config/db.js"; // import your Firestore connection

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running! ✅ Firestore connection is active.");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
