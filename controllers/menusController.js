import Menu from "../models/menusModel.js";
import Category from "../models/categoriesModel.js";
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
import { Op } from "sequelize";

// Get all menus
export const getMenus = async (req, res) => {
   try {
      // Filtering parameters
      const categoryId = req.query.categoryId;
      const categoryName = req.query.categoryName;
      const menuName = req.query.menuName;
      const minPrice = parseFloat(req.query.minPrice);
      const maxPrice = parseFloat(req.query.maxPrice);
      const searchQuery = req.query.searchQuery;

      // Sorting parameters
      const sortBy = req.query.sortBy || "menuName";
      const sortOrder = req.query.sortOrder || "ASC";

      // Build filter object based on query parameters
      const filter = {};
      if (categoryId) {
         filter["$categoryId$"] = categoryId;
      }
      if (categoryName) {
         filter["$category.categoryName$"] = categoryName;
      }
      if (menuName) {
         filter.menuName = { [Op.like]: `%${menuName}%` };
      }
      if (!isNaN(minPrice)) {
         filter.price = { [Op.gte]: minPrice };
      }
      if (!isNaN(maxPrice)) {
         filter.price = {
            ...filter.price,
            [Op.lte]: maxPrice,
         };
      }
      // Build search query condition
      const searchCondition = searchQuery
         ? {
              [Op.or]: [
                 { menuName: { [Op.like]: `%${searchQuery}%` } },
                 {
                    "$menus.menuDescription$": {
                       [Op.like]: `%${searchQuery}%`,
                    },
                 },
              ],
           }
         : {};

      // Find products with associated data and apply filtering, search, and sorting
      const menus = await Menu.findAll({
         include: [
            {
               model: Category,
               attributes: {
                  exclude: ["categoryId", "createdAt", "updatedAt"],
               },
            },
         ],
         where: {
            ...filter,
            ...searchCondition,
         },
         order: [[sortBy, sortOrder]],
         subQuery: false,
      });

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: menus,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Get a menu by ID
export const getMenuById = async (req, res) => {
   try {
      const { menuId } = req.params;
      const menu = await Menu.findByPk(menuId);
      if (!menu) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
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
      // Extract data from request body and files
      const { menuName, menuDescription, categoryId, price, stock } = req.body;
      const imageFile = req.files ? req.files.menuImage : null;

      // Check if menu already exists
      const existingMenu = await Menu.findOne({
         where: { menuName },
      });
      if (existingMenu) {
         return res.status(messages.HTTP_STATUS.CONFLICT.code).json({
            code: messages.HTTP_STATUS.CONFLICT.code,
            message: messages.duplicate_name.replace("%{name}", "Menu"),
         });
      }

      // Validate menu name
      const menuNameValidationError = validateRequiredStringField(
         menuName,
         "Menu name"
      );
      if (menuNameValidationError) {
         return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
            code: messages.HTTP_STATUS.BAD_REQUEST.code,
            message: menuNameValidationError,
         });
      }
      let menuImageUrl = null;
      if (imageFile) {
         // Validate image upload
         const maxImages = 1;
         const maxImageSize = 10 * 1024 * 1024;
         const imageUploadValidationError = validateImageUpload(
            imageFile,
            maxImages,
            maxImageSize
         );
         if (imageUploadValidationError) {
            return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
               code: messages.HTTP_STATUS.BAD_REQUEST.code,
               message: imageUploadValidationError,
            });
         }
         // Upload image to Cloudinary
         menuImageUrl = await uploadImageToCloudinary(imageFile, "warung_19");
      }

      // Create menu
      const menu = await Menu.create({
         menuName,
         menuDescription,
         categoryId,
         price,
         stock,
         menuImageUrl,
      });

      // Return success response
      res.status(messages.HTTP_STATUS.CREATED.code).json({
         code: messages.HTTP_STATUS.CREATED.code,
         message: messages.x_created_successfully.replace("%{name}", "Menu"),
         data: menu,
      });
   } catch (error) {
      // Handle server errors
      handleServerError(error, res);
   }
};

// Update a menu by ID
export const updateMenu = async (req, res) => {
   try {
      const { menuId } = req.params;
      const { menuName, menuDescription, categoryId, price, stock } = req.body;
      const imageFile = req.files ? req.files.menuImage : null;

      let menu = await Menu.findByPk(menuId);
      if (!menu) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.x_not_found.replace("%{name}", "Menu"),
         });
      }

      // Check if menu with same menu_name exists
      if (menuName && menuName !== menu.menuName) {
         const existingMenu = await Menu.findOne({
            where: { menuName },
         });
         if (existingMenu) {
            return res.status(messages.HTTP_STATUS.CONFLICT.code).json({
               code: messages.HTTP_STATUS.CONFLICT.code,
               message: messages.duplicate_name.replace("%{name}", "Menu"),
            });
         }
         validateRequiredStringField(menuName, "Menu name");
      }

      // Validate image upload
      if (imageFile) {
         const maxImages = 1;
         const maxImageSize = 10 * 1024 * 1024;
         const imageUploadValidationError = validateImageUpload(
            imageFile,
            maxImages,
            maxImageSize
         );
         if (imageUploadValidationError) {
            return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
               code: messages.HTTP_STATUS.BAD_REQUEST.code,
               message: imageUploadValidationError,
            });
         }

         // Upload new image and delete old image if exists
         if (menu.menuImageUrl) {
            await deleteImageFromCloudinary(menu.menuImageUrl);
         }
         menu.menuImageUrl = await uploadImageToCloudinary(
            imageFile,
            "warung_19"
         );
      }

      // Update menu properties
      menu.menuName = menuName || menu.menuName;
      menu.menuDescription = menuDescription || menu.menuDescription;
      menu.categoryId = categoryId || menu.categoryId;
      menu.price = price || menu.price;
      menu.stock = stock || menu.stock;

      // Save the updated menu
      await menu.save();

      // Return success response
      res.status(messages.HTTP_STATUS.OK.code).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_updated_successfully.replace("%{name}", "Menu"),
         data: menu,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Delete a menu by ID
export const deleteMenu = async (req, res) => {
   try {
      const { menuId } = req.params;

      const menu = await Menu.findByPk(menuId);
      if (!menu) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.code,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
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
