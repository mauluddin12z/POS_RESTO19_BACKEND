import express from "express";
import {
   registerUser,
   loginUser,
   logoutUser,
   refreshToken,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
   createUser,
   deleteUser,
   getSession,
   getUserById,
   getUsers,
   updateUser,
} from "../controllers/usersController.js";
import { isSuperAdmin } from "../middlewares/authorizeRole.js";

const router = express.Router();

router.post("/register", verifyToken, registerUser);
router.post("/login", loginUser);
router.delete("/logout", verifyToken, logoutUser);
router.get("/users", verifyToken, isSuperAdmin, getUsers);
router.get("/user/:userId", verifyToken, getUserById);
router.get("/auth/session", verifyToken, getSession);
router.post("/user", verifyToken, isSuperAdmin, createUser);
router.post("/token", refreshToken);
router.patch("/user/:userId", verifyToken, isSuperAdmin, updateUser);
router.delete("/user/:userId", verifyToken, isSuperAdmin, deleteUser);
export default router;
