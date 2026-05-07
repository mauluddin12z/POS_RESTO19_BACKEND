
import messages from "../../utils/messages.js";
import * as OrderDetailService from "./orderDetails.service.js";

/**
 * GET ALL
 */
export const getOrderDetails = async (req, res, next) => {
   try {
      const data = await OrderDetailService.getOrderDetails(req.query);

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data,
      });
   } catch (err) {
      next(err);
   }
};

/**
 * GET BY ID
 */
export const getOrderDetailById = async (req, res, next) => {
   try {
      const data = await OrderDetailService.getOrderDetailById(req.params.orderDetailId);

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data,
      });
   } catch (err) {
      next(err);
   }
};

/**
 * CREATE
 */
export const createOrderDetail = async (req, res, next) => {
   try {
      const data = await OrderDetailService.createOrderDetail(
         req.body
      );

      res.status(messages.HTTP_STATUS.CREATED.code).json({
         code: messages.HTTP_STATUS.CREATED.code,
         message: messages.x_created_successfully.replace(
            "%{name}",
            "Order detail",
         ),
         data,
      });
   } catch (err) {
      next(err);
   }
};

/**
 * UPDATE
 */
export const updateOrderDetail = async (req, res, next) => {
   try {
      const data = await OrderDetailService.updateOrderDetail(
         req.params.orderDetailId,
         req.body,
      );

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_updated_successfully.replace(
            "%{name}",
            "Order detail",
         ),
         data,
      });
   } catch (err) {
      next(err);
   }
};

/**
 * DELETE
 */
export const deleteOrderDetail = async (req, res, next) => {
   try {
      const data = await OrderDetailService.deleteOrderDetail(req.params.orderDetailId);

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_deleted_successfully.replace(
            "%{name}",
            "Order detail",
         ),
         data,
      });
   } catch (err) {
      next(err);
   }
};

/**
 * DELETE BY ORDER ID
 */
export const deleteOrderDetailsByOrderId = async (req, res, next) => {
   try {
      await OrderDetailService.deleteOrderDetailsByOrderId(req.params.orderId);

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_deleted_successfully.replace(
            "%{name}",
            "Order details",
         ),
      });
   } catch (err) {
      next(err);
   }
};
