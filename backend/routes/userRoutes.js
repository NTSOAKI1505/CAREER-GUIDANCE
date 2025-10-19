// routes/userRoutes.js
import express from "express";
import { createUser, getAllUsers, getUserById, updateUser, deleteUser
} from "../controllers/userController.js";

const router = express.Router();

// Only admin can create users
router.post("/", createUser);

// CRUD routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
