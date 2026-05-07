import Order from "./orders.model.js";
import User from "../users/users.model.js";
import OrderDetail from "../order-details/orderDetails.model.js";
import Menu from "../menus/menus.model.js";
import Category from "../categories/categories.model.js";

import { Op } from "sequelize";
import { DateTime } from "luxon";
import { buildQueryOptions } from "../../utils/queryBuilder.js";
import messages from "../../utils/messages.js";


// GET ORDERS
export const getOrders = async (query = {}) => {
   // --- SAFE SEARCH ---
   const keyword = query.searchQuery?.trim().slice(0, 50);
   delete query.searchQuery;

   let searchCondition = null;

   if (keyword) {
      searchCondition = {
         [Op.or]: [
            { paymentMethod: { [Op.like]: `%${keyword}%` } },
            { "$user.name$": { [Op.like]: `%${keyword}%` } },
         ],
      };
   }

   // --- DEFAULT SORT ---
   if (!query.sort) query.sort = "-createdAt";

   const queryOptions = buildQueryOptions(query, {
      allowedFields: [
         "total",
         "paymentMethod",
         "paymentStatus",
         "createdAt",
      ],
      allowedSort: [
         "createdAt",
         "total",
         "paymentMethod",
         "paymentStatus",
      ],
   });

   const where = {
      [Op.and]: [
         queryOptions.where,
         ...(searchCondition ? [searchCondition] : []),
      ],
   };

   // --- RELATION FILTERS ---
   if (query.userId) {
      where["$user.userId$"] = Number(query.userId);
   }

   if (query.username) {
      where["$user.name$"] = {
         [Op.like]: `%${query.username}%`,
      };
   }

   // --- DATE FILTER ---
   const now = DateTime.now().setZone("Asia/Jakarta");

   if (query.dateRange) {
      let start, end;

      switch (query.dateRange) {
         case "today":
            start = now.startOf("day");
            end = now.endOf("day");
            break;
         case "thisWeek":
            start = now.startOf("week");
            end = now.endOf("week");
            break;
         case "thisMonth":
            start = now.startOf("month");
            end = now.endOf("month");
            break;
         case "thisYear":
            start = now.startOf("year");
            end = now.endOf("year");
            break;
      }

      if (start && end) {
         where.createdAt = {
            [Op.between]: [
               start.toUTC().toJSDate(),
               end.toUTC().toJSDate(),
            ],
         };
      }
   }

   if (query.fromDate || query.toDate) {
      where.createdAt = where.createdAt || {};

      if (query.fromDate) {
         where.createdAt[Op.gte] = DateTime.fromISO(query.fromDate)
            .toUTC()
            .toJSDate();
      }

      if (query.toDate) {
         where.createdAt[Op.lte] = DateTime.fromISO(query.toDate)
            .toUTC()
            .toJSDate();
      }
   }

   // --- QUERY ---
   const { count, rows } = await Order.findAndCountAll({
      ...queryOptions,
      where,
      distinct: true, // IMPORTANT
      include: [
         {
            model: User,
            as: "user",
            attributes: ["userId", "name"],
            required: false,
         },
         {
            model: OrderDetail,
            separate: true,
            include: [{ model: Menu, include: [{ model: Category }] }],
            required: false,
         },
      ],
      subQuery: false
   });

   const totalItems = count || 0;
   const totalPages = Math.ceil(totalItems / queryOptions.limit);

   const result = {
      data: rows,
      pagination: {
         ...queryOptions.pagination,
         totalItems,
         totalPages,
         hasNextPage:
            queryOptions.pagination.currentPage < totalPages,
      },
   };

   return result;
};

// GET BY ID
export const getOrderById = async (id) => {
   const order = await Order.findByPk(id, {
      include: [
         { model: User },
         { model: OrderDetail, include: [Menu] },
      ],
   });

   if (!order) throw { status: 404, message: messages.x_not_found.replace("%{name}", "Order") };

   return order;
};



// CREATE (WITH TRANSACTION + DETAILS)
export const createOrder = async (data) => {
   const t = await Order.sequelize.transaction();

   try {
      const { items, ...orderData } = data;

      let total = 0;

      // Get all menu IDs
      const menuIds = items.map((item) => item.menuId);

      // Fetch menus once
      const menus = await Menu.findAll({
         where: {
            menuId: menuIds,
         },
         transaction: t,
      });

      // Create lookup map
      const menuMap = {};

      menus.forEach((menu) => {
         menuMap[menu.menuId] = menu;
      });

      const orderDetails = [];

      for (const item of items) {
         const menu = menuMap[item.menuId];

         if (!menu) {
            throw {
               status: 404,
               message: `Menu with ID ${item.menuId} not found`,
            };
         }

         const subtotal = Number(menu.price) * item.quantity;

         total += subtotal;

         orderDetails.push({
            menuId: item.menuId,
            quantity: item.quantity,
            price: menu.price,
            subtotal,
            notes: item.notes || "",
         });
      }

      // Create order
      const order = await Order.create(
         {
            ...orderData,
            total,
         },
         {
            transaction: t,
         },
      );

      // Attach orderId
      const detailsWithOrderId = orderDetails.map((detail) => ({
         ...detail,
         orderId: order.orderId,
      }));

      // Bulk create details
      await OrderDetail.bulkCreate(detailsWithOrderId, {
         transaction: t,
      });

      await t.commit();

      return order;
   } catch (err) {
      await t.rollback();
      throw err;
   }
};

// UPDATE
export const updateOrder = async (id, data) => {
   const t = await Order.sequelize.transaction();

   try {
      const order = await Order.findByPk(id, {
         transaction: t,
      });

      if (!order) {
         throw {
            status: 404,
            message: messages.x_not_found.replace("%{name}", "Order"),
         };
      }

      const { items, ...orderData } = data;

      let total = 0;

      // Get all menu IDs
      const menuIds = items.map((item) => item.menuId);

      // Fetch menus once
      const menus = await Menu.findAll({
         where: {
            menuId: menuIds,
         },
         transaction: t,
      });

      // Create lookup map
      const menuMap = {};

      menus.forEach((menu) => {
         menuMap[menu.menuId] = menu;
      });

      const orderDetails = [];

      for (const item of items) {
         const menu = menuMap[item.menuId];

         if (!menu) {
            throw {
               status: 404,
               message: `Menu with ID ${item.menuId} not found`,
            };
         }

         const subtotal = Number(menu.price) * item.quantity;

         total += subtotal;

         orderDetails.push({
            orderId: id,
            menuId: item.menuId,
            quantity: item.quantity,
            price: menu.price,
            subtotal,
            notes: item.notes || "",
         });
      }

      // Update order
      await order.update(
         {
            ...orderData,
            total,
         },
         {
            transaction: t,
         },
      );

      // Replace details
      await OrderDetail.destroy({
         where: { orderId: id },
         transaction: t,
      });

      // Bulk create details
      await OrderDetail.bulkCreate(orderDetails, {
         transaction: t,
      });

      await t.commit();

      return order;
   } catch (err) {
      await t.rollback();
      throw err;
   }
};

// Payment
export const payment = async (id, data) => {
   const t = await Order.sequelize.transaction();

   try {
      const order = await Order.findByPk(id, {
         transaction: t,
      });

      if (!order) {
         throw {
            status: 404,
            message: messages.x_not_found.replace("%{name}", "Order"),
         };
      }
      // Update order
      await order.update(
         {
            paymentMethod: data.paymentMethod,
            paymentStatus: data.paymentStatus
         },
         {
            transaction: t,
         },
      );
      await t.commit();

      return order;
   } catch (err) {
      await t.rollback();
      throw err;
   }
};

// DELETE (RESTORE STOCK)
export const deleteOrder = async (id) => {
   const t = await Order.sequelize.transaction();

   try {
      const order = await Order.findByPk(id, {
         include: [OrderDetail],
         transaction: t,
         lock: t.LOCK.UPDATE,
      });

      if (!order) {
         throw { status: 404, message: messages.x_not_found.replace("%{name}", "Order") };
      }

      for (const detail of order.orderDetails) {
         const menu = await Menu.findByPk(detail.menuId, {
            transaction: t,
         });

         if (menu) {
            menu.stock += detail.quantity;
            await menu.save({ transaction: t });
         }
      }

      await OrderDetail.destroy({
         where: { orderId: id },
         transaction: t,
      });

      await order.destroy({ transaction: t });

      await t.commit();

      return order;
   } catch (err) {
      await t.rollback();
      throw err;
   }
};