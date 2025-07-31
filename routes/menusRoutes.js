import express from "express";
import {
   createMenu,
   deleteMenu,
   getMenuById,
   getMenus,
   updateMenu,
} from "../controllers/menusController.js";

const router = express.Router();

router.get("/menus", getMenus);
router.get("/menu/:menuId", getMenuById);
router.post("/menu", createMenu);
router.patch("/menu/:menuId", updateMenu);
router.delete("/menu/:menuId", deleteMenu);

export default router;
