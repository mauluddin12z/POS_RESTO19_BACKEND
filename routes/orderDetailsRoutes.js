import express from "express";
import {
   createOrderDetail,
   deleteOrderDetail,
   getOrderDetails,
   getOrderDetailById,
   updateOrderDetail,
   deleteOrderDetailsByOrderId,
} from "../controllers/orderDetailsController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/order-details", verifyToken, getOrderDetails);
router.get("/order-detail/:orderDetailId", verifyToken, getOrderDetailById);
router.post("/order-detail", verifyToken, createOrderDetail);
router.patch("/order-detail/:orderDetailId", verifyToken, updateOrderDetail);
router.delete("/order-detail/:orderDetailId", verifyToken, deleteOrderDetail);
router.delete("/order-detail/:orderDetailId", verifyToken, deleteOrderDetail);
router.delete(
   "/order-details/by-order/:orderId",
   verifyToken,
   deleteOrderDetailsByOrderId
);

export default router;
