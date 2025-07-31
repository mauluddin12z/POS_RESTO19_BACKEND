import Sale from "../models/salesModel.js";
import User from "../models/usersModel.js";
import messages from "../utils/messages.js";
import SaleDetail from "../models/saleDetailsModel.js";
import Menu from "../models/menusModel.js";
import Category from "../models/categoriesModel.js";
import { handleServerError } from "../utils/errorHandler.js";
import { validateRequiredField } from "../utils/validation.js"; // assumed utility

// Get all sales
export const getSales = async (req, res) => {
   try {
      const sales = await Sale.findAll({
         attributes: ["saleId", "total", "paymentMethod", "notes", "createdAt", "updatedAt"],
         include: [
            {
               model: User,
               attributes: ["userId", "name"],
            },
            {
               model: SaleDetail,
               attributes: ["saleDetailId", "quantity", "price"],
               include: [
                  {
                     model: Menu,
                     attributes: ["menuId", "menuName", "menuDescription", "price"],
                     include: {
                        model: Category,
                        attributes: ["categoryId", "categoryName"],
                     },
                  },
               ],
            },
         ],
         order: [["createdAt", "DESC"]],
      });

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: sales,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Get a sale by ID
export const getSaleById = async (req, res) => {
   try {
      const { saleId } = req.params;

      const sale = await Sale.findByPk(saleId, {
         include: [{ model: User, attributes: ["userId", "name"] }],
      });

      if (!sale) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: sale,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Create a new sale
export const createSale = async (req, res) => {
   try {
      const { userId, total, paymentMethod, notes } = req.body;

      // Validate required fields
      const userIdError = validateRequiredField(userId, "User ID");
      const totalError = validateRequiredField(total, "Total amount");

      if (userIdError || totalError) {
         return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
            code: messages.HTTP_STATUS.BAD_REQUEST.code,
            message: userIdError || totalError,
         });
      }

      const sale = await Sale.create({
         userId,
         total,
         paymentMethod,
         notes,
      });

      res.status(messages.HTTP_STATUS.CREATED.code).json({
         code: messages.HTTP_STATUS.CREATED.code,
         message: messages.x_created_successfully.replace("%{name}", "Sale"),
         data: sale,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Update a sale
export const updateSale = async (req, res) => {
   try {
      const { saleId } = req.params;
      const { userId, total, paymentMethod, notes } = req.body;

      const sale = await Sale.findByPk(saleId);
      if (!sale) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      sale.userId = userId ?? sale.userId;
      sale.total = total ?? sale.total;
      sale.paymentMethod = paymentMethod ?? sale.paymentMethod;
      sale.notes = notes ?? sale.notes;

      await sale.save();

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_updated_successfully.replace("%{name}", "Sale"),
         data: sale,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Delete a sale
export const deleteSale = async (req, res) => {
   try {
      const { saleId } = req.params;

      const sale = await Sale.findByPk(saleId);
      if (!sale) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      await sale.destroy();

      res.status(messages.HTTP_STATUS.OK.code).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_deleted_successfully.replace("%{name}", "Sale"),
         data: sale,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};
