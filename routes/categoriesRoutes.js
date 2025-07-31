import express from "express";
import {
   createCategory,
   deleteCategory,
   getCategories,
   getCategoryById,
   updateCategory,
} from "../controllers/categoriesController.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/category/:categoryId", getCategoryById);
router.post("/category", createCategory);
router.patch("/category/:categoryId", updateCategory);
router.delete("/category/:categoryId", deleteCategory);

export default router;
