import PaymentLog from "../models/paymentLogsModel.js";
import Sale from "../models/salesModel.js";
import messages from "../utils/messages.js";
import { handleServerError } from "../utils/errorHandler.js";
import { validateRequiredField } from "../utils/validation.js";

// Get all payment logs
export const getPaymentLogs = async (req, res) => {
   try {
      const logs = await PaymentLog.findAll({
         include: [{ model: Sale }],
         order: [["paymentLogId", "DESC"]],
      });

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: logs,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Get payment log by ID
export const getPaymentLogById = async (req, res) => {
   try {
      const { paymentLogId } = req.params;

      const log = await PaymentLog.findByPk(paymentLogId, {
         include: [{ model: Sale }],
      });

      if (!log) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: log,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Create a new payment log
export const createPaymentLog = async (req, res) => {
   try {
      const { saleId, amountPaid, changeReturned } = req.body;

      // Validate required fields
      const saleIdError = validateRequiredField(saleId, "Sale ID");
      const amountPaidError = validateRequiredField(amountPaid, "Amount Paid");
      const changeReturnedError = validateRequiredField(
         changeReturned,
         "Change Returned"
      );

      if (saleIdError || amountPaidError || changeReturnedError) {
         return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
            code: messages.HTTP_STATUS.BAD_REQUEST.code,
            message: saleIdError || amountPaidError || changeReturnedError,
         });
      }

      const log = await PaymentLog.create({
         saleId,
         amountPaid,
         changeReturned,
      });

      res.status(messages.HTTP_STATUS.CREATED.code).json({
         code: messages.HTTP_STATUS.CREATED.code,
         message: messages.x_created_successfully.replace(
            "%{name}",
            "Payment log"
         ),
         data: log,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Update a payment log
export const updatePaymentLog = async (req, res) => {
   try {
      const { paymentLogId } = req.params;
      const { amountPaid, changeReturned } = req.body;

      const log = await PaymentLog.findByPk(paymentLogId);
      if (!log) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      log.amountPaid = amountPaid ?? log.amountPaid;
      log.changeReturned = changeReturned ?? log.changeReturned;

      await log.save();

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_updated_successfully.replace(
            "%{name}",
            "Payment log"
         ),
         data: log,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Delete a payment log
export const deletePaymentLog = async (req, res) => {
   try {
      const { paymentLogId } = req.params;

      const log = await PaymentLog.findByPk(paymentLogId);
      if (!log) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      await log.destroy();

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_deleted_successfully.replace(
            "%{name}",
            "Payment log"
         ),
         data: log,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};
