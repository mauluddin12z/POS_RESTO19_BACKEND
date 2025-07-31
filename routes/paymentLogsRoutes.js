import express from "express";
import {
   createPaymentLog,
   deletePaymentLog,
   getPaymentLogById,
   getPaymentLogs,
   updatePaymentLog,
} from "../controllers/paymentLogsController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/payment-logs",verifyToken, getPaymentLogs);
router.get("/payment-log/:paymentLogId",verifyToken, getPaymentLogById);
router.post("/payment-log",verifyToken, createPaymentLog);
router.patch("/payment-log/:paymentLogId",verifyToken, updatePaymentLog);
router.delete("/payment-log/:paymentLogId",verifyToken, deletePaymentLog);

export default router;
