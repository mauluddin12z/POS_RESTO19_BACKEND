import express from "express";
import {
   createCategory,
   updateCategory,
   deleteCategory,
   getCategories,
   getCategoryById,
} from "../controllers/categoriesController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isSuperAdmin } from "../middlewares/authorizeRole.js";

const router = express.Router();

router.get("/categories", verifyToken, getCategories);
router.get("/category/:categoryId", verifyToken, getCategoryById);
router.post("/category", verifyToken, isSuperAdmin, createCategory);
router.patch(
   "/category/:categoryId",
   verifyToken,
   isSuperAdmin,
   updateCategory
);
router.delete(
   "/category/:categoryId",
   verifyToken,
   isSuperAdmin,
   deleteCategory
);

export default router;
