import Users from "./users.model.js";
import Order from "../orders/orders.model.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { buildQueryOptions } from "../../utils/queryBuilder.js";
import messages from "../../utils/messages.js";
import dotenv from "dotenv";
dotenv.config();

// SAFE ATTRIBUTES (DRY)
const safeAttributes = ["userId", "name", "username", "role", "createdAt"];

// GET ALL USERS (WITH SEARCH + PAGINATION)
export const getAllUsers = async (query = {}) => {
   const queryOptions = buildQueryOptions(query, {
      allowedFields: ["name", "username", "role", "createdAt"],
      allowedSort: ["name", "username", "role", "createdAt"],
   });

   const keyword = query.searchQuery?.trim().slice(0, 50);
   delete query.searchQuery;

   let searchCondition = null;

   if (keyword) {
      searchCondition = {
         [Op.or]: [
            { name: { [Op.like]: `%${keyword}%` } },
            { username: { [Op.like]: `%${keyword}%` } },
         ],
      };
   }

   const where = {
      [Op.and]: [
         queryOptions.where,
         ...(searchCondition ? [searchCondition] : []),
      ],
   };

   const { count, rows } = await Users.findAndCountAll({
      ...queryOptions,
      where,
      attributes: safeAttributes,
      order: [["createdAt", "DESC"]],
   });

   const totalItems = count || 0;
   const totalPages = Math.ceil(totalItems / queryOptions.limit);

   return {
      data: rows,
      pagination: {
         ...queryOptions.pagination,
         totalItems,
         totalPages,
         hasNextPage:
            queryOptions.pagination.currentPage < totalPages,
      },
   };
};

// GET BY ID
export const getUserById = async (userId) => {
   const user = await Users.findByPk(userId, {
      attributes: safeAttributes,
   });

   if (!user) {
      throw { status: 404, message: "User not found" };
   }

   return user;
};

// CREATE USER
export const createUser = async (payload) => {
   const { name, username, password, role } = payload;

   const existingUser = await Users.findOne({
      where: { username },
   });

   if (existingUser) {
      throw { status: 409, message: messages.username_exists };
   }

   const hashedPassword = await bcrypt.hash(password, 10);

   const user = await Users.create({
      name: name.trim(),
      username: username.trim(),
      password: hashedPassword,
      role,
   });

   return {
      userId: user.userId,
      name: user.name,
      username: user.username,
      role: user.role,
   };
};

// UPDATE USER (TRANSACTION SAFE)
export const updateUser = async (userId, payload) => {
   const t = await Users.sequelize.transaction();

   try {
      const user = await Users.findByPk(userId, {
         transaction: t,
         lock: t.LOCK.UPDATE,
      });

      if (!user) {
         throw { status: 404, message: messages.x_not_found.replace("%{name}", "User") };
      }

      if (payload.username && payload.username !== user.username) {
         const duplicate = await Users.findOne({
            where: { username: payload.username },
            transaction: t,
         });

         if (duplicate) {
            throw { status: 409, message: messages.username_exists };
         }
      }

      if (payload.password) {
         user.password = await bcrypt.hash(payload.password, 10);
      }

      user.name = payload.name ?? user.name;
      user.username = payload.username ?? user.username;
      user.role = payload.role ?? user.role;

      await user.save({ transaction: t });

      await t.commit();

      return {
         userId: user.userId,
         name: user.name,
         username: user.username,
         role: user.role,
      };
   } catch (err) {
      await t.rollback();
      throw err;
   }
};

// DELETE USER (SAFE CHECK)
export const deleteUser = async (userId) => {
   const t = await Users.sequelize.transaction();

   try {
      const user = await Users.findByPk(userId, {
         transaction: t,
         lock: t.LOCK.UPDATE,
      });

      if (!user) {
         throw { status: 404, message: messages.x_not_found.replace("%{name}", "User") };
      }

      // prevent deleting users with orders
      const hasOrders = await Order.findOne({
         where: { userId },
         transaction: t,
      });

      if (hasOrders) {
         throw {
            status: 400,
            message: process.env.APP_LANG = en ? "Cannot delete user with existing orders." : "Tidak dapat menghapus pengguna dengan pesanan yang sudah ada.",
         };
      }

      await user.destroy({ transaction: t });

      await t.commit();

      return true;
   } catch (err) {
      await t.rollback();
      throw err;
   }
};