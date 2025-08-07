import express from "express";
import {
   getOrders,
   getOrderById,
   createOrder,
   updateOrder,
   deleteOrder,
} from "../controllers/ordersController.js";

const router = express.Router();

router.get("/orders", getOrders);
router.get("/order/:orderId", getOrderById);
router.post("/order", createOrder);
router.patch("/order/:orderId", updateOrder);
router.delete("/order/:orderId", deleteOrder);

export default router;
