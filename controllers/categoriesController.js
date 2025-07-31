import Category from "../models/categoriesModel.js";
import messages from "../utils/messages.js";
import { handleServerError } from "../utils/errorHandler.js";
import { validateRequiredStringField } from "../utils/validation.js";

// Get all categories
export const getCategories = async (req, res) => {
   try {
      const categories = await Category.findAll();
      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: categories,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Get a category by ID
export const getCategoryById = async (req, res) => {
   try {
      const { categoryId } = req.params;
      const category = await Category.findByPk(categoryId);
      if (!category) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.message,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }
      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: category,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Create a new category
export const createCategory = async (req, res) => {
   try {
      const categoriesData = Array.isArray(req.body) ? req.body : [req.body];

      const createdCategories = [];

      for (const item of categoriesData) {
         const { categoryName } = item;

         // Validate
         const validationError = validateRequiredStringField(
            categoryName,
            "Category name"
         );
         if (validationError) {
            return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
               code: messages.HTTP_STATUS.BAD_REQUEST.code,
               message: validationError,
            });
         }

         // Check if already exists
         const existingCategory = await Category.findOne({
            where: { categoryName },
         });
         if (existingCategory) {
            return res.status(messages.HTTP_STATUS.CONFLICT.code).json({
               code: messages.HTTP_STATUS.CONFLICT.code,
               message: messages.duplicate_name.replace(
                  "%{name}",
                  categoryName
               ),
            });
         }

         const newCategory = await Category.create({ categoryName });
         createdCategories.push(newCategory);
      }

      res.status(messages.HTTP_STATUS.CREATED.code).json({
         code: messages.HTTP_STATUS.CREATED.code,
         message: messages.x_created_successfully.replace(
            "%{name}",
            "Categories"
         ),
         data: createdCategories,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Update a category by ID
export const updateCategory = async (req, res) => {
   try {
      const { categoryId } = req.params;
      const { categoryName } = req.body;

      let category = await Category.findByPk(categoryId);
      if (!category) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.message,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      // Check if category with same name exists
      if (categoryName && categoryName !== category.categoryName) {
         const existingCategory = await Category.findOne({
            where: { categoryName },
         });
         if (existingCategory) {
            return res.status(messages.HTTP_STATUS.CONFLICT.code).json({
               code: messages.HTTP_STATUS.CONFLICT.code,
               message: messages.duplicate_name.replace("%{name}", "category"),
            });
         }
      }

      // Validate input
      const validationError = validateRequiredStringField(
         categoryName,
         "Category name"
      );
      if (validationError) {
         return res.status(messages.HTTP_STATUS.BAD_REQUEST.code).json({
            code: messages.HTTP_STATUS.BAD_REQUEST.code,
            message: validationError,
         });
      }

      category.categoryName = categoryName || category.categoryName;
      await category.save();

      res.status(messages.HTTP_STATUS.OK.code).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_updated_successfully.replace(
            "%{name}",
            "Category"
         ),
         data: category,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

// Delete a category by ID
export const deleteCategory = async (req, res) => {
   try {
      const { categoryId } = req.params;

      const category = await Category.findByPk(categoryId);
      if (!category) {
         return res.status(messages.HTTP_STATUS.NOT_FOUND.code).json({
            code: messages.HTTP_STATUS.NOT_FOUND.message,
            message: messages.HTTP_STATUS.NOT_FOUND.message,
         });
      }

      await category.destroy();

      res.status(messages.HTTP_STATUS.OK.code).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_deleted_successfully.replace(
            "%{name}",
            "Category"
         ),
         data: category,
      });
   } catch (error) {
      handleServerError(error, res);
   }
};
