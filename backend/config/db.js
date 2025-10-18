// backend/config/db.js
import admin from "firebase-admin";
import path from "path";

let db; // declare in module scope

try {
  const serviceAccount = path.resolve("config/serviceAccountKey.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  db = admin.firestore();
  console.log("✅ Firestore connected successfully!");
} catch (error) {
  console.error("❌ Firestore connection failed:", error);
}

export { db }; // now db is always defined in the module scope
