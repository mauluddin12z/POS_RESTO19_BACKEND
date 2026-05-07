import express from "express";
import * as controller from "./orders.controller.js";
import { verifyToken } from "../../common/middlewares/verifyToken.js";
import { authorizeRoles } from "../../common/middlewares/authorizeRole.js";
import { validate } from "../../common/middlewares/validation.js"
import { createOrderSchema, paymentSchema, updateOrderSchema } from "./orders.schema.js";
import { parseJsonFields } from "../../utils/parseJsonFields.js";

const router = express.Router();

// GET all orders (admin or staff)
router.get(
   "/",
   verifyToken,
   authorizeRoles("admin", "superadmin"),
   controller.getOrders,
);

// GET order by ID
router.get("/:orderId", verifyToken, controller.getOrderById);

// CREATE order (user or admin depending on app logic)
router.post("/", verifyToken, parseJsonFields(["items"]), validate(createOrderSchema), controller.createOrder);

// UPDATE order (admin only)
router.patch(
   "/:orderId",
   verifyToken,
   parseJsonFields(["items"]),
   validate(updateOrderSchema),
   controller.updateOrder,
)
// UPDATE order (admin only)
router.patch(
   "/:orderId/payment",
   verifyToken,
   validate(paymentSchema),
   controller.payment,
);

// DELETE order (superadmin only)
router.delete(
   "/:orderId",
   verifyToken,
   authorizeRoles("superadmin"),
   controller.deleteOrder,
);

export default router;
