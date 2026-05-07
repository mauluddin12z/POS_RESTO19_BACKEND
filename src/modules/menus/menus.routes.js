import express from "express";
import * as controller from "./menus.controller.js";
import { authorizeRoles } from "../../common/middlewares/authorizeRole.js";
import { verifyToken } from "../../common/middlewares/verifyToken.js";
import { validate } from "../../common/middlewares/validation.js"
import { createMenuSchema, updateMenuSchema } from "./menus.schema.js";

const router = express.Router();

// GET all menus
router.get("/", verifyToken, controller.getMenus);

// GET menu by ID
router.get("/:menuId", verifyToken, controller.getMenuById);

// CREATE menu
router.post("/", verifyToken, validate(createMenuSchema), controller.createMenu);

// UPDATE menu (admin only)
router.patch(
   "/:menuId",
   verifyToken,
   authorizeRoles("superadmin"),
   validate(updateMenuSchema),
   controller.updateMenu,
);

// DELETE menu (superadmin only)
router.delete(
   "/:menuId",
   verifyToken,
   authorizeRoles("superadmin"),
   controller.deleteMenu,
);

export default router;
