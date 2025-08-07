import express from "express";
import {
   createOrderDetail,
   deleteOrderDetail,
   getOrderDetails,
   getOrderDetailById,
   updateOrderDetail,
} from "../controllers/orderDetailsController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/order-details", verifyToken, getOrderDetails);
router.get("/order-detail/:orderDetailId", verifyToken, getOrderDetailById);
router.post("/order-detail", verifyToken, createOrderDetail);
router.patch("/order-detail/:orderDetailId", verifyToken, updateOrderDetail);
router.delete("/order-detail/:orderDetailId", verifyToken, deleteOrderDetail);

export default router;
