import express from "express";
import {
   createMenu,
   deleteMenu,
   getMenuById,
   getMenus,
   updateMenu,
} from "../controllers/menusController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isSuperAdmin } from "../middlewares/authorizeRole.js";

const router = express.Router();

router.get("/menus", verifyToken, getMenus);
router.get("/menu/:menuId", verifyToken, getMenuById);
router.post("/menu", verifyToken, createMenu);
router.patch("/menu/:menuId", verifyToken, updateMenu);
router.delete("/menu/:menuId", verifyToken, deleteMenu);

export default router;
