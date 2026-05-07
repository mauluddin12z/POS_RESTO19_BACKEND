import Category from "./categories.model.js";
import Menu from "../menus/menus.model.js";
import { Op } from "sequelize";
import { buildQueryOptions } from "../../utils/queryBuilder.js";
import messages from "../../utils/messages.js";
import dotenv from "dotenv";
dotenv.config();

// GET CATEGORIES
export const getCategories = async (query = {}) => {
   // --- SEARCH ---
   const keyword = query.searchQuery?.trim().slice(0, 50);
   delete query.searchQuery;

   let searchCondition = {};

   if (keyword) {
      searchCondition = {
         categoryName: {
            [Op.like]: `%${keyword}%`,
         },
      };
   }

   // --- DEFAULT SORT ---
   if (!query.sort) {
      query.sort = "-categoryId";
   }

   const queryOptions = buildQueryOptions(query, {
      allowedFields: ["categoryName", "categoryId"],
      allowedSort: ["categoryName", "categoryId"],
   });

   const where = {
      ...queryOptions.where,
      ...searchCondition,
   };

   const { count, rows } = await Category.findAndCountAll({
      ...queryOptions,
      where,
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
export const getCategoryById = async (id) => {
   const category = await Category.findByPk(id);

   if (!category) {
      throw {
         status: 404, message: messages.x_not_found.replace(
            "%{name}",
            "Category",
         ),
      };
   }

   return category;
};

// CREATE (BULK + TRANSACTION)
export const createCategory = async (payload) => {
   const t = await Category.sequelize.transaction();

   try {
      const items = Array.isArray(payload) ? payload : [payload];

      const names = items.map((i) =>
         i.categoryName?.trim()
      );

      // --- CHECK DUPLICATES IN DB ---
      const existing = await Category.findAll({
         where: {
            categoryName: { [Op.in]: names },
         },
         transaction: t,
      });

      if (existing.length) {
         throw {
            status: 409,
            message: messages.duplicate_name.replace("%{name}", "Category"),
         };
      }

      // --- CREATE BULK ---
      const created = await Category.bulkCreate(
         names.map((name) => ({ categoryName: name })),
         { transaction: t }
      );

      await t.commit();

      return created;
   } catch (err) {
      await t.rollback();
      throw err;
   }
};

// UPDATE
export const updateCategory = async (id, { categoryName }) => {
   const t = await Category.sequelize.transaction();

   try {
      const category = await Category.findByPk(id, {
         transaction: t,
         lock: t.LOCK.UPDATE,
      });

      if (!category) {
         throw { status: 404, message: messages.x_not_found.replace("%{name}", "Category") };
      }

      if (categoryName) {
         const trimmed = categoryName.trim();

         const exists = await Category.findOne({
            where: {
               categoryName: trimmed,
               categoryId: { [Op.ne]: id },
            },
            transaction: t,
         });

         if (exists) {
            throw { status: 409, message: messages.duplicate_name.replace("%{name}", "Category"), };
         }

         category.categoryName = trimmed;
      }

      await category.save({ transaction: t });

      await t.commit();

      return category;
   } catch (err) {
      await t.rollback();
      throw err;
   }
};

// DELETE (SAFE)
export const deleteCategory = async (id) => {
   const t = await Category.sequelize.transaction();

   try {
      const category = await Category.findByPk(id, {
         transaction: t,
         lock: t.LOCK.UPDATE,
      });

      if (!category) {
         throw { status: 404, message: messages.x_not_found.replace("%{name}", "Menu") };
      }
      await category.destroy({ transaction: t });
      await t.commit();
      return category;
   } catch (err) {
      await t.rollback();
      throw err;
   }
};