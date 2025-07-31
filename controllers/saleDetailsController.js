import SaleDetail from "../models/saleDetailsModel.js";
import Menu from "../models/menusModel.js";
import Sale from "../models/salesModel.js";
import messages from "../utils/messages.js";
import { handleServerError } from "../utils/errorHandler.js";
import { validateRequiredField } from "../utils/validation.js";

// Get all sale details
export const getSaleDetails = async (req, res) => {
   try {
      const saleDetails = await SaleDetail.findAll({
         include: [
            { model: Sale },
            { model: Menu, attributes: ["menuId", "name", "price"] },
         ],
         order: [["saleDetailId", "DESC"]],
      });

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: saleDetails,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Get sale detail by ID
export const getSaleDetailById = async (req, res) => {
   try {
      const { saleDetailId } = req.params;
      const detail = await SaleDetail.findByPk(saleDetailId, {
         include: [{ model: Menu, attributes: ["menuId", "name", "price"] }],
      });

      if (!detail) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: detail,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Create new sale detail
export const createSaleDetail = async (req, res) => {
   try {
      const { saleId, menuId, quantity, price } = req.body;

      // Validate required fields
      const saleIdError = validateRequiredField(saleId, "Sale ID");
      const menuIdError = validateRequiredField(menuId, "Menu ID");
      const quantityError = validateRequiredField(quantity, "Quantity");
      const priceError = validateRequiredField(price, "Price");

      if (saleIdError || menuIdError || quantityError || priceError) {
         return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
            code: messages.HTTP_STATUS.BAD_REQUEST.code,
            message: saleIdError || menuIdError || quantityError || priceError,
         });
      }

      const subtotal = price * quantity;

      const detail = await SaleDetail.create({
         saleId,
         menuId,
         quantity,
         price,
         subtotal,
      });

      res.status(messages.HTTP_STATUS.CREATED.code).json({
         code: messages.HTTP_STATUS.CREATED.code,
         message: messages.x_created_successfully.replace(
            "%{name}",
            "Sale detail"
         ),
         data: detail,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Update sale detail
export const updateSaleDetail = async (req, res) => {
   try {
      const { saleDetailId } = req.params;
      const { quantity, price } = req.body;

      const detail = await SaleDetail.findByPk(saleDetailId);
      if (!detail) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      // If either quantity or price is updated, subtotal should be recalculated
      const newQuantity = quantity ?? detail.quantity;
      const newPrice = price ?? detail.price;

      detail.quantity = newQuantity;
      detail.price = newPrice;
      detail.subtotal = newQuantity * newPrice;

      await detail.save();

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_updated_successfully.replace(
            "%{name}",
            "Sale detail"
         ),
         data: detail,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Delete sale detail
export const deleteSaleDetail = async (req, res) => {
   try {
      const { saleDetailId } = req.params;

      const detail = await SaleDetail.findByPk(saleDetailId);
      if (!detail) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      await detail.destroy();

      res.status(messages.HTTP_STATUS.OK.code).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_deleted_successfully.replace(
            "%{name}",
            "Sale detail"
         ),
         data: detail,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};
