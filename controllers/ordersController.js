import Order from "../models/ordersModel.js";
import User from "../models/usersModel.js";
import messages from "../utils/messages.js";
import OrderDetail from "../models/orderDetailsModel.js";
import Menu from "../models/menusModel.js";
import Category from "../models/categoriesModel.js";
import { handleServerError } from "../utils/errorHandler.js";
import { validateRequiredField } from "../utils/validation.js"; // assumed utility

// Get all Orders
export const getOrders = async (req, res) => {
   try {
      const {
         userId,
         username,
         minTotal,
         maxTotal,
         paymentMethod,
         searchQuery,
         page = 1,
         pageSize = 10,
         sortBy = "createdAt",
         sortOrder = "DESC",
      } = req.query;

      const pageNum = parseInt(page, 10);
      const size = parseInt(pageSize, 10);
      const minT = parseFloat(minTotal);
      const maxT = parseFloat(maxTotal);

      // Allowed sort fields whitelist to avoid SQL errors or injection
      const allowedSortFields = ["createdAt", "total", "paymentMethod", "paymentStatus"];
      const sortField = allowedSortFields.includes(sortBy)
         ? sortBy
         : "createdAt";
      const orderDirection =
         sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

      const filter = {};

      if (userId) {
         filter["$user.userId$"] = userId;
      }
      if (username) {
         filter["$user.name$"] = { [Op.like]: `%${username}%` };
      }
      if (!isNaN(minT) || !isNaN(maxT)) {
         filter.total = {};
         if (!isNaN(minT)) filter.total[Op.gte] = minT;
         if (!isNaN(maxT)) filter.total[Op.lte] = maxT;
      }
      if (paymentMethod) {
         filter.paymentMethod = paymentMethod;
      }

      // Build search condition
      const searchCondition = searchQuery
         ? {
              [Op.or]: [
                 { paymentMethod: { [Op.like]: `%${searchQuery}%` } },
                 { notes: { [Op.like]: `%${searchQuery}%` } },
              ],
           }
         : {};

      const offset = (pageNum - 1) * size;

      const { count, rows: orders } = await Order.findAndCountAll({
         attributes: [
            "orderId",
            "total",
            "paymentMethod",
            "paymentStatus",
            "createdAt",
            "updatedAt",
         ],
         include: [
            {
               model: User,
               attributes: ["userId", "name"],
            },
            {
               model: OrderDetail,
               attributes: ["orderDetailId", "quantity", "price", "subtotal", "notes"],
               include: [
                  {
                     model: Menu,
                     attributes: [
                        "menuId",
                        "menuName",
                        "menuDescription",
                        "price",
                     ],
                     include: {
                        model: Category,
                        attributes: ["categoryId", "categoryName"],
                     },
                  },
               ],
            },
         ],
         where: {
            ...filter,
            ...searchCondition,
         },
         order: [[sortField, orderDirection]],
         limit: size,
         offset,
      });

      const totalPages = Math.ceil(count / size);
      const hasNextPage = pageNum < totalPages;

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: orders,
         pagination: {
            totalItems: count,
            totalPages,
            currentPage: pageNum,
            pageSize: size,
            hasNextPage,
         },
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Get a order by ID
export const getOrderById = async (req, res) => {
   try {
      const { orderId } = req.params;

      const order = await Order.findByPk(orderId, {
         include: [{ model: User, attributes: ["userId", "name"] }],
      });

      if (!order) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: order,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Create a new order
export const createOrder = async (req, res) => {
   try {
      const { userId, total, paymentMethod, paymentStatus } = req.body;

      // Validate required fields
      const userIdError = validateRequiredField(userId, "User ID");
      const totalError = validateRequiredField(total, "Total amount");

      if (userIdError || totalError) {
         return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
            code: messages.HTTP_STATUS.BAD_REQUEST.code,
            message: userIdError || totalError,
         });
      }

      const order = await Order.create({
         userId,
         total,
         paymentMethod,
         paymentStatus,
      });

      res.status(messages.HTTP_STATUS.CREATED.code).json({
         code: messages.HTTP_STATUS.CREATED.code,
         message: messages.x_created_successfully.replace("%{name}", "Order"),
         data: order,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Update a order
export const updateOrder = async (req, res) => {
   try {
      const { orderId } = req.params;
      const { userId, total, paymentMethod, paymentStatus } = req.body;

      const order = await Order.findByPk(orderId);
      if (!order) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      order.userId = userId ?? order.userId;
      order.total = total ?? order.total;
      order.paymentMethod = paymentMethod ?? order.paymentMethod;
      order.paymentStatus = paymentStatus ?? order.paymentStatus;

      await order.save();

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_updated_successfully.replace("%{name}", "Order"),
         data: order,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Delete a order
export const deleteOrder = async (req, res) => {
   try {
      const { orderId } = req.params;

      const order = await Order.findByPk(orderId);
      if (!order) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      await order.destroy();

      res.status(messages.HTTP_STATUS.OK.code).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_deleted_successfully.replace("%{name}", "Order"),
         data: order,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};
