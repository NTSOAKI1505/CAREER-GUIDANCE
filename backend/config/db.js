// backend/config/db.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let db;

try {
  let serviceAccount;

  // ✅ Check if the FIREBASE_SERVICE_ACCOUNT env variable exists
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log("Using Firebase credentials from environment variable");
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // ✅ Fallback for local development
    const serviceAccountPath = path.resolve("config/serviceAccountKey.json");
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    console.log("Using Firebase credentials from local file");
  }

  // ✅ Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  // ✅ Connect Firestore
  db = admin.firestore();
  console.log("✅ Firestore connected successfully!");
} catch (error) {
  console.error("❌ Firestore connection failed:", error);
}

export { db };
