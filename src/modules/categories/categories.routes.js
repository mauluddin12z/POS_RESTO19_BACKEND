import express from "express";
import * as controller from "./categories.controller.js";
import { authorizeRoles } from "../../common/middlewares/authorizeRole.js";
import { verifyToken } from "../../common/middlewares/verifyToken.js";
import { validate } from "../../common/middlewares/validation.js"
import { categorySchema } from "./categories.schema.js";

const router = express.Router();

// GET all categories
router.get("/", verifyToken, controller.getCategories);

// GET category by ID
router.get("/:categoryId", verifyToken, controller.getCategoryById);

// CREATE category
router.post("/", verifyToken, validate(categorySchema), controller.createCategory);

// UPDATE category (superadmin only)
router.patch(
   "/:categoryId",
   verifyToken,
   authorizeRoles("superadmin"),
   validate(categorySchema),
   controller.updateCategory,
);

// DELETE category (superadmin only)
router.delete(
   "/:categoryId",
   verifyToken,
   authorizeRoles("superadmin"),
   controller.deleteCategory,
);

export default router;