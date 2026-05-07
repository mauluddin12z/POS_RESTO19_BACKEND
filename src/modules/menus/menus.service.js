import Menu from "./menus.model.js";
import Category from "../categories/categories.model.js";
import OrderDetail from "../order-details/orderDetails.model.js";
import { Op, col, fn } from "sequelize";
import { buildQueryOptions } from "../../utils/queryBuilder.js";
import messages from "../../utils/messages.js";
import { validateImageUpload } from "../../utils/validation.js";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "../../utils/cloudinaryHelper.js";
import dotenv from "dotenv";
dotenv.config();

// GET MENUS
export const getMenus = async (query = {}) => {
   // --- SEARCH ---
   const keyword = query.searchQuery?.trim().slice(0, 50);
   delete query.searchQuery;

   let searchCondition = null;

   if (keyword) {
      searchCondition = {
         [Op.or]: [
            // FULL-TEXT (fallback to LIKE)
            { menuName: { [Op.like]: `%${keyword}%` } },
            { "$category.categoryName$": { [Op.like]: `%${keyword}%` } },
         ],
      };
   }

   // --- DEFAULT SORT ---
   if (!query.sort) query.sort = "-menuId";

   const queryOptions = buildQueryOptions(query, {
      allowedFields: ["menuName", "price", "stock", "categoryId"],
      allowedSort: ["menuName", "price", "stock", "menuId"],
   });

   const where = {
      [Op.and]: [
         queryOptions.where,
         ...(searchCondition ? [searchCondition] : []),
      ],
   };

   const rows = await Menu.findAll({
      ...queryOptions,
      where,

      include: [
         {
            model: Category,
            attributes: ["categoryId", "categoryName"],
            required: false,
         },
         {
            model: OrderDetail,
            attributes: [],
            required: false,
         },
      ],

      attributes: [
         "menuId",
         "categoryId",
         "menuName",
         "menuDescription",
         "price",
         "stock",
         [
            fn("COALESCE", fn("SUM", col("orderDetails.quantity")), 0),
            "orderCount",
         ],
         "menuImageUrl"
      ],

      group: ["menus.menuId", "category.categoryId"],
      subQuery: false,
   });

   const totalItems = await Menu.count({
      where,
      include: [{ model: Category, required: false }],
      distinct: true,
      col: "menuId",
   });

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
export const getMenuById = async (id) => {
   const order = await Menu.findByPk(id, {
      include: [
         {
            model: Category,
            attributes: ["categoryId", "categoryName"],
            required: false,
         },
         {
            model: OrderDetail,
            attributes: [],
            required: false,
         },
      ],
   });

   if (!order) throw { status: 404, message: "Order not found" };

   return order;
};

// CREATE (WITH TRANSACTION)
export const createMenu = async (data, imageData) => {
   const t = await Menu.sequelize.transaction();

   try {
      const { menuName, categoryId } = data;
      const imageFile = imageData ? imageData.menuImage : null;

      let menuImageUrl = null;

      const exists = await Menu.findOne({
         where: { menuName },
         transaction: t,
         lock: t.LOCK.UPDATE,
      });

      if (exists) {
         throw { status: 409, message: messages.duplicate_name.replace("%{name}", "Menu"), };
      }

      const category = await Category.findByPk(categoryId, {
         transaction: t,
      });

      if (!category) {
         throw { status: 400, message: messages.x_invalid.replace("%{name}", "Category") };
      }


      // Handle image upload (if provided)
      if (imageFile) {
         const maxImages = 1;
         const maxImageSize = 10 * 1024 * 1024;

         const imageValidationError = validateImageUpload(
            imageFile,
            maxImages,
            maxImageSize
         );

         if (imageValidationError) {
            throw { status: 400, message: imageValidationError };
         }

         menuImageUrl = await uploadImageToCloudinary(
            imageFile,
            "resto_19"
         );
      }

      const menu = await Menu.create(
         {
            ...data,
            menuImageUrl,
         },
         { transaction: t }
      );

      await t.commit();

      return menu;
   } catch (err) {
      await t.rollback();
      throw err;
   }
};

// UPDATE (WITH TRANSACTION)
export const updateMenu = async (menuId, data, imageData) => {
   const t = await Menu.sequelize.transaction();

   try {
      const imageFile = imageData?.menuImage || null;

      const { menuName } = data || {};

      const menu = await Menu.findByPk(menuId, { transaction: t });

      if (!menu) {
         throw {
            status: 404,
            message: messages.x_not_found.replace("%{name}", "Menu"),
         };
      }

      // Duplicate check
      if (menuName && menuName.trim() !== menu.menuName) {
         const existingMenu = await Menu.findOne({
            where: { menuName: menuName.trim() },
            transaction: t,
         });

         if (existingMenu) {
            throw {
               status: 409,
               message: messages.duplicate_name.replace("%{name}", "Menu"),
            };
         }
      }

      let newImageUrl = null;

      if (imageFile) {
         const imageError = validateImageUpload(
            imageFile,
            1,
            10 * 1024 * 1024
         );

         if (imageError) {
            throw { status: 400, message: imageError };
         }

         newImageUrl = await uploadImageToCloudinary(
            imageFile,
            "resto_19"
         );
      }

      // Build update payload
      const updatePayload = {
         ...data,
      };

      if (menuName) {
         updatePayload.menuName = menuName.trim();
      }

      if (newImageUrl) {
         if (menu.menuImageUrl) {
            await deleteImageFromCloudinary(menu.menuImageUrl);
         }

         updatePayload.menuImageUrl = newImageUrl;
      }

      // Single source of truth update
      await menu.update(updatePayload, { transaction: t });

      await t.commit();

      return menu;
   } catch (error) {
      await t.rollback();
      throw error;
   }
};

// DELETE (SAFE + TRANSACTION)
export const deleteMenu = async (id) => {
   const t = await Menu.sequelize.transaction();

   try {
      const menu = await Menu.findByPk(id, {
         transaction: t,
         lock: t.LOCK.UPDATE,
      });

      if (!menu) {
         throw { status: 404, message: messages.x_not_found.replace("%{name}", "Menu") };
      }

      const used = await OrderDetail.findOne({
         where: { menuId: id },
         transaction: t,
      });
      if (menu.menuImageUrl) {
         await deleteImageFromCloudinary(menu.menuImageUrl);
      }
      await menu.destroy({ transaction: t });

      await t.commit();
      return menu;
   } catch (err) {
      await t.rollback();
      throw err;
   }
};