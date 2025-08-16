import Menu from "../models/menusModel.js";
import Category from "../models/categoriesModel.js";
import Order from "../models/ordersModel.js";
import OrderDetail from "../models/orderDetailsModel.js";
import messages from "../utils/messages.js";
import { handleServerError } from "../utils/errorHandler.js";
import {
   deleteImageFromCloudinary,
   uploadImageToCloudinary,
} from "../utils/cloudinaryHelper.js";
import {
   validateImageUpload,
   validateRequiredStringField,
} from "../utils/validation.js";
import { Op, Sequelize } from "sequelize";

// Utility: validate menu input fields
const validateMenuInput = ({ menuName, categoryId, price, stock }) => {
   const requiredFields = [
      { value: menuName, name: "Menu name" },
      { value: categoryId, name: "Category ID" },
      { value: price, name: "Price" },
      { value: stock, name: "Stock" },
   ];
   for (const field of requiredFields) {
      const error = validateRequiredStringField(field.value, field.name);
      if (error) return error;
   }
   return null;
};

// Get all menus with filtering, searching, sorting, pagination
export const getMenus = async (req, res) => {
   try {
      const {
         categoryId,
         categoryName,
         menuName,
         minPrice,
         maxPrice,
         searchQuery,
         page = 1,
         pageSize = 10,
         sortBy = "menuName",
         sortOrder = "ASC",
         mostOrdered = "false",
      } = req.query;

      const pageNum = parseInt(page, 10);
      const size = parseInt(pageSize, 10);
      const minP = parseFloat(minPrice);
      const maxP = parseFloat(maxPrice);
      const mostOrderedBool = mostOrdered.toLowerCase() === "true";

      // Allowed sort fields whitelist
      const allowedSortFields = ["menuName", "price", "stock", "categoryId"];
      const sortField = allowedSortFields.includes(sortBy)
         ? sortBy
         : "menuName";
      const orderDirection =
         sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

      const filter = {};

      if (categoryId) {
         filter["$category.categoryId$"] = categoryId;
      }
      if (categoryName) {
         filter["$category.categoryName$"] = categoryName;
      }
      if (menuName) {
         filter.menuName = { [Op.like]: `%${menuName}%` };
      }

      if (!isNaN(minP) || !isNaN(maxP)) {
         filter.price = {};
         if (!isNaN(minP)) filter.price[Op.gte] = minP;
         if (!isNaN(maxP)) filter.price[Op.lte] = maxP;
      }

      const searchCondition = searchQuery
         ? {
              [Op.or]: [
                 { menuName: { [Op.like]: `%${searchQuery}%` } },
                 { menuDescription: { [Op.like]: `%${searchQuery}%` } },
              ],
           }
         : {};

      const offset = (pageNum - 1) * size;

      // Build ordering logic
      const order = [];

      // Always push menus with stock = 0 to the end first
      order.push([Sequelize.literal("stock = 0"), "ASC"]);

      // Then apply your main sort
      if (mostOrderedBool) {
         order.push([Sequelize.literal("orderCount"), orderDirection]);
      } else {
         order.push([sortField, orderDirection]);
      }

      // Always push menus with stock = 0 to the end
      order.push([Sequelize.literal("stock = 0"), "ASC"]);

      const { count, rows: menus } = await Menu.findAndCountAll({
         attributes: {
            include: mostOrderedBool
               ? [
                    [
                       Sequelize.fn(
                          "SUM",
                          Sequelize.col("OrderDetails.quantity")
                       ),
                       "orderCount",
                    ],
                 ]
               : [],
         },
         include: [
            {
               model: Category,
               attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
               model: OrderDetail,
               attributes: [],
               required: mostOrderedBool,
            },
         ],
         where: {
            ...filter,
            ...searchCondition,
         },
         group: ["menus.menuId", "category.categoryId"],
         order,
         limit: size,
         offset,
         subQuery: false,
         distinct: true,
      });

      const totalPages = Math.ceil(count.length / size);
      const hasNextPage = pageNum < totalPages;

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: menus,
         pagination: {
            totalItems: count.length,
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

// Get menu by ID with category included
export const getMenuById = async (req, res) => {
   try {
      const { menuId } = req.params;
      const menu = await Menu.findByPk(menuId, {
         include: [{ model: Category }],
      });
      if (!menu) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.x_not_found.replace("%{name}", "Menu"),
         });
      }
      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: menu,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Create a new menu
export const createMenu = async (req, res) => {
   try {
      const { menuName, menuDescription, categoryId, price, stock } = req.body;
      const imageFile = req.files ? req.files.menuImage : null;
      // Validate input fields
      const validationError = validateMenuInput({
         menuName,
         categoryId,
         price,
         stock,
      });
      if (validationError) {
         return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
            code: messages.HTTP_STATUS.BAD_REQUEST.code,
            message: validationError,
         });
      }

      // Check for duplicate menu name
      const existingMenu = await Menu.findOne({ where: { menuName } });
      if (existingMenu) {
         return res.status(messages.HTTP_STATUS.CONFLICT.code).json({
            code: messages.HTTP_STATUS.CONFLICT.code,
            message: messages.duplicate_name.replace("%{name}", "Menu"),
         });
      }

      // Optional: Validate category exists here (recommended)
      const categoryExists = await Category.findByPk(categoryId);
      if (!categoryExists) {
         return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
            code: messages.HTTP_STATUS.BAD_REQUEST.code,
            message: `Category with ID ${categoryId} does not exist.`,
         });
      }

      let menuImageUrl = null;

      if (imageFile) {
         // Validate image
         const maxImages = 1;
         const maxImageSize = 10 * 1024 * 1024;
         const imageValidationError = validateImageUpload(
            imageFile,
            maxImages,
            maxImageSize
         );
         if (imageValidationError) {
            return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
               code: messages.HTTP_STATUS.BAD_REQUEST.code,
               message: imageValidationError,
            });
         }

         // Upload to Cloudinary
         menuImageUrl = await uploadImageToCloudinary(imageFile, "resto_19");
      }

      const menu = await Menu.create({
         menuName,
         menuDescription,
         categoryId,
         price,
         stock,
         menuImageUrl,
      });

      res.status(messages.HTTP_STATUS.CREATED.code).json({
         code: messages.HTTP_STATUS.CREATED.code,
         message: messages.x_created_successfully.replace("%{name}", "Menu"),
         data: menu,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Update menu by ID
export const updateMenu = async (req, res) => {
   try {
      const { menuId } = req.params;
      const { menuName, menuDescription, categoryId, price, stock } = req.body;
      const imageFile = req.files ? req.files.menuImage : null;
      console.log(req);

      let menu = await Menu.findByPk(menuId);
      if (!menu) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.x_not_found.replace("%{name}", "Menu"),
         });
      }

      // If updating menuName, check for duplicates and validate
      if (menuName !== undefined && menuName !== menu.menuName) {
         const existingMenu = await Menu.findOne({ where: { menuName } });
         if (existingMenu) {
            return res.status(messages.HTTP_STATUS.CONFLICT.code).json({
               code: messages.HTTP_STATUS.CONFLICT.code,
               message: messages.duplicate_name.replace("%{name}", "Menu"),
            });
         }
         const nameValidationError = validateRequiredStringField(
            menuName,
            "Menu name"
         );
         if (nameValidationError) {
            return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
               code: messages.HTTP_STATUS.BAD_REQUEST.code,
               message: nameValidationError,
            });
         }
         menu.menuName = menuName;
      }

      // Validate other fields if provided
      if (menuDescription !== undefined) {
         menu.menuDescription = menuDescription;
      }
      if (categoryId !== undefined) {
         // Validate category exists
         const categoryExists = await Category.findByPk(categoryId);
         if (!categoryExists) {
            return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
               code: messages.HTTP_STATUS.BAD_REQUEST.code,
               message: `Category with ID ${categoryId} does not exist.`,
            });
         }
         menu.categoryId = categoryId;
      }
      if (price !== undefined) {
         menu.price = price;
      }
      if (stock !== undefined) {
         menu.stock = stock;
      }

      // Handle image upload/update
      if (imageFile) {
         const maxImages = 1;
         const maxImageSize = 10 * 1024 * 1024;
         const imageValidationError = validateImageUpload(
            imageFile,
            maxImages,
            maxImageSize
         );
         if (imageValidationError) {
            return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
               code: messages.HTTP_STATUS.BAD_REQUEST.code,
               message: imageValidationError,
            });
         }

         // Delete old image if exists
         if (menu.menuImageUrl) {
            await deleteImageFromCloudinary(menu.menuImageUrl);
         }

         menu.menuImageUrl = await uploadImageToCloudinary(
            imageFile,
            "resto_19"
         );
      }

      await menu.save();

      res.status(messages.HTTP_STATUS.OK.code).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_updated_successfully.replace("%{name}", "Menu"),
         data: menu,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Delete menu by ID
export const deleteMenu = async (req, res) => {
   try {
      const { menuId } = req.params;

      const menu = await Menu.findByPk(menuId);
      if (!menu) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.x_not_found.replace("%{name}", "Menu"),
         });
      }

      if (menu.menuImageUrl) {
         await deleteImageFromCloudinary(menu.menuImageUrl);
      }

      await menu.destroy();

      res.status(messages.HTTP_STATUS.OK.code).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_deleted_successfully.replace("%{name}", "Menu"),
         data: menu,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};
