import express from "express";
import * as controller from "./paymentLogs.controller.js";
import { verifyToken } from "../../common/middlewares/verifyToken.js";
import { validate } from "../../common/middlewares/validation.js"
import { createPaymentLogSchema } from "./paymentLogs.schema.js";


const router = express.Router();

router.get("/", verifyToken, controller.getPaymentLogs);
router.get("/:paymentLogId", verifyToken, controller.getPaymentLogById);
router.post("/", verifyToken,validate(createPaymentLogSchema), controller.createPaymentLog);
router.patch("/:paymentLogId", verifyToken, controller.updatePaymentLog);
router.delete("/:paymentLogId", verifyToken, controller.deletePaymentLog);

export default router;
