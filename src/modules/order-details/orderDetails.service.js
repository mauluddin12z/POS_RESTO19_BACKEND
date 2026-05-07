import OrderDetail from "./orderDetails.model.js";
import Menu from "../menus/menus.model.js";
import Order from "../orders/orders.model.js";
import { buildQueryOptions } from "../../utils/queryBuilder.js";
import messages from "../../utils/messages.js";

// GET ALL ORDER DETAILS
export const getOrderDetails = async (query = {}) => {

   const queryOptions = buildQueryOptions(query, {
      allowedFields: ["quantity", "price", "subtotal", "createdAt"],
      allowedSort: ["createdAt", "quantity", "price", "subtotal"],
   });

   const { count, rows } = await OrderDetail.findAndCountAll({
      ...queryOptions,
      distinct: true,
      include: [
         { model: Order },
         { model: Menu },
      ],
   });

   const totalItems = count || 0;
   const totalPages = Math.ceil(totalItems / queryOptions.limit);

   const result = {
      data: rows,
      pagination: {
         ...queryOptions.pagination,
         totalItems,
         totalPages,
         hasNextPage: queryOptions.pagination.currentPage < totalPages,
      },
   };

   return result;
};

// GET BY ID
export const getOrderDetailById = async (id) => {
   const data = await OrderDetail.findByPk(id, {
      include: [Order, Menu],
   });
   if (!data) throw { status: 404, message: "Order detail not found" };
   return data;
};

// CREATE (TRANSACTION SAFE)
export const createOrderDetail = async (
   data
) => {
   const { orderId, menuId, price, quantity, subtotal, notes } = data
   const t = await OrderDetail.sequelize.transaction();

   try {
      const menu = await Menu.findByPk(menuId, {
         transaction: t,
         lock: t.LOCK.UPDATE,
      });

      if (!menu) {
         throw { status: 404, message: messages.x_not_found.replace("%{name}", "Menu") };
      }

      if (menu.stock < quantity) {
         throw { status: 400, message: messages.insufficient_stock };
      }

      const detail = await OrderDetail.create(
         {
            orderId,
            menuId,
            quantity,
            price,
            subtotal,
            notes,
         },
         { transaction: t }
      );

      menu.stock -= quantity;
      await menu.save({ transaction: t });

      await t.commit();
      return detail;
   } catch (err) {
      await t.rollback();
      throw err;
   }
};

// UPDATE (FIXED STOCK HANDLING)
export const updateOrderDetail = async (id, data) => {
   const t = await OrderDetail.sequelize.transaction();

   try {
      const detail = await OrderDetail.findByPk(id, {
         transaction: t,
         lock: t.LOCK.UPDATE,
      });

      if (!detail) {
         throw { status: 404, message: messages.x_not_found.replace("%{name}", "Order Detail") };
      }

      const menu = await Menu.findByPk(detail.menuId, {
         transaction: t,
         lock: t.LOCK.UPDATE,
      });

      const oldQty = detail.quantity;
      const newQty = data.quantity ?? oldQty;

      const diff = newQty - oldQty;

      // adjust stock
      if (menu) {
         if (diff > 0 && menu.stock < diff) {
            throw { status: 400, message: messages.insufficient_stock };
         }

         menu.stock -= diff;
         await menu.save({ transaction: t });
      }

      detail.quantity = newQty;
      detail.price = data.price ?? detail.price;
      detail.subtotal = data.subtotal ?? detail.subtotal;
      detail.notes = data.notes ?? detail.notes;

      await detail.save({ transaction: t });

      await t.commit();

      return detail;
   } catch (err) {
      await t.rollback();
      throw err;
   }
};

// DELETE (TRANSACTION SAFE)
export const deleteOrderDetail = async (id) => {
   const t = await OrderDetail.sequelize.transaction();

   try {
      const detail = await OrderDetail.findByPk(id, {
         transaction: t,
         lock: t.LOCK.UPDATE,
      });

      if (!detail) {
         throw { status: 404, message: messages.x_not_found.replace("%{name}", "Order Detail") };
      }

      const menu = await Menu.findByPk(detail.menuId, {
         transaction: t,
      });

      if (menu) {
         menu.stock += detail.quantity;
         await menu.save({ transaction: t });
      }

      await detail.destroy({ transaction: t });

      await t.commit();

      return detail;
   } catch (err) {
      await t.rollback();
      throw err;
   }
};

// DELETE BY ORDER ID (OPTIMIZED + SAFE)
export const deleteOrderDetailsByOrderId = async (orderId) => {
   const t = await OrderDetail.sequelize.transaction();

   try {
      const details = await OrderDetail.findAll({
         where: { orderId },
         transaction: t,
      });

      if (!details.length) {
         throw {
            status: 404,
            message: messages.x_not_found.replace("%{name}", "Order Details"),
         };
      }

      // batch update menus instead of N queries (optimization)
      for (const item of details) {
         const menu = await Menu.findByPk(item.menuId, {
            transaction: t,
         });

         if (menu) {
            menu.stock += item.quantity;
            await menu.save({ transaction: t });
         }
      }

      await OrderDetail.destroy({
         where: { orderId },
         transaction: t,
      });

      await t.commit();
      return true;
   } catch (err) {
      await t.rollback();
      throw err;
   }
};