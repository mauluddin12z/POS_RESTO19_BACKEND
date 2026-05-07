import express from "express";
const router = express.Router();

// TEMP: still using old routes (we’ll refactor later)
import usersRoutes from "../modules/users/users.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import categoriesRoutes from "../modules/categories/categories.routes.js";
import menusRoutes from "../modules/menus/menus.routes.js";
import ordersRoutes  from "../modules/orders/orders.routes.js";
import orderDetailssRoutes from "../modules/order-details/orderDetails.routes.js";

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/categories", categoriesRoutes);
router.use("/menus", menusRoutes);
router.use("/orders", ordersRoutes);
router.use("/order-details", orderDetailssRoutes);
router.use("/payment-logs", ordersRoutes);

export default router;
