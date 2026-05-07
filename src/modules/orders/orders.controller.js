import * as service from "./orders.service.js";
import messages from "../../utils/messages.js";

// GET ALL
export const getOrders = async (req, res, next) => {
   try {
      const result = await service.getOrders(req.query);

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         ...result,
      });
   } catch (err) {
      next(err);
   }
};

// GET BY ID
export const getOrderById = async (req, res, next) => {
   try {
      const data = await service.getOrderById(req.params.orderId);

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data,
      });
   } catch (err) {
      next(err);
   }
};

// CREATE
export const createOrder = async (req, res, next) => {
   try {
      const data = await service.createOrder(req.body);

      res.status(201).json({
         code: messages.HTTP_STATUS.CREATED.code,
         message: messages.x_created_successfully.replace(
            "%{name}",
            "Order",
         ),
         data,
      });
   } catch (err) {
      next(err);
   }
};

// UPDATE
export const updateOrder = async (req, res, next) => {
   try {
      const data = await service.updateOrder(req.params.orderId, req.body);

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_updated_successfully.replace(
            "%{name}",
            "Order",
         ),
         data,
      });
   } catch (err) {
      next(err);
   }
};

// UPDATE
export const payment = async (req, res, next) => {
   try {
      const data = await service.payment(req.params.orderId, req.body);

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_updated_successfully.replace(
            "%{name}",
            "Payment",
         ),
         data,
      });
   } catch (err) {
      next(err);
   }
};

// DELETE
export const deleteOrder = async (req, res, next) => {
   try {
      const data = await service.deleteOrder(req.params.orderId);

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_deleted_successfully.replace(
            "%{name}",
            "Order",
         ),
         data,
      });
   } catch (err) {
      next(err);
   }
};
