import express from "express";
import {
   createUser,
   deleteUser,
   getSession,
   getUserById,
   getUsers,
   updateUser,
} from "./users.controller.js";
import { authorizeRoles } from "../../common/middlewares/authorizeRole.js";
import { verifyToken } from "../../common/middlewares/verifyToken.js";
import { validate } from "../../common/middlewares/validation.js"
import { createUserSchema, updateUserSchema } from "./users.schema.js";

const router = express.Router();

// Session
router.get("/session", verifyToken, getSession);

// Users CRUD
router.get("/", verifyToken, authorizeRoles("superadmin"), getUsers);
router.get("/:userId", verifyToken, getUserById);
router.post("/", verifyToken, authorizeRoles("superadmin"), validate(createUserSchema), createUser);
router.patch("/:userId", verifyToken, authorizeRoles("superadmin"), validate(updateUserSchema), updateUser);
router.delete(
   "/:userId",
   verifyToken,
   authorizeRoles("superadmin"),
   deleteUser,
);

export default router;
