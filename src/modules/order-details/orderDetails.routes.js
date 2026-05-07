import express from "express";
import * as controller from "./orderDetails.controller.js";
import { verifyToken } from "../../common/middlewares/verifyToken.js";
import { authorizeRoles } from "../../common/middlewares/authorizeRole.js";
import { validate } from "../../common/middlewares/validation.js"
import { createOrderDetailSchema, updateOrderDetailSchema } from "./orderDetails.schema.js";

const router = express.Router();

// GET all order details (admin or staff)
router.get(
   "/",
   verifyToken,
   authorizeRoles("admin", "superadmin"),
   controller.getOrderDetails,
);

// GET order by ID
router.get("/:orderDetailId", verifyToken, controller.getOrderDetailById);

// CREATE order (user or admin depending on app logic)
router.post("/", verifyToken, validate(createOrderDetailSchema), controller.createOrderDetail);

// UPDATE order (admin only)
router.patch(
   "/:orderDetailId",
   verifyToken,
   validate(updateOrderDetailSchema),
   controller.updateOrderDetail,
);

// DELETE order (superadmin only)
router.delete(
   "/:orderDetailId",
   verifyToken,
   controller.deleteOrderDetail,
);

// DELETE order details by order ID
router.delete(
   "/by-order/:orderId",
   verifyToken,
   controller.deleteOrderDetailsByOrderId,
);

export default router;
