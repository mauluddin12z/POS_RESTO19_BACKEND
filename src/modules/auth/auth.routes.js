import express from "express";
import {
   registerUser,
   loginUser,
   logoutUser,
   refreshToken,
} from "./auth.controller.js";

import { verifyToken } from "../../common/middlewares/verifyToken.js";
import { validate } from "../../common/middlewares/validation.js"
import { loginSchema, registerSchema } from "./auth.schema.js";

const router = express.Router();

// Public
router.post("/login", validate(loginSchema), loginUser);
router.post("/token", refreshToken);

// Protected
router.post("/register", verifyToken, validate(registerSchema), registerUser);
router.delete("/logout", verifyToken, logoutUser);

export default router;
