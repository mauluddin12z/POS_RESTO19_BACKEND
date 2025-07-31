import express from "express";
import {
   createPaymentLog,
   deletePaymentLog,
   getPaymentLogById,
   getPaymentLogs,
   updatePaymentLog,
} from "../controllers/paymentLogsController.js";

const router = express.Router();

router.get("/payment-logs", getPaymentLogs);
router.get("/payment-log/:paymentLogId", getPaymentLogById);
router.post("/payment-log", createPaymentLog);
router.patch("/payment-log/:paymentLogId", updatePaymentLog);
router.delete("/payment-log/:paymentLogId", deletePaymentLog);

export default router;
