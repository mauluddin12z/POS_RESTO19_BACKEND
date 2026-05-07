import * as categoryService from "./categories.service.js";
import messages from "../../utils/messages.js";

// Get all
export const getCategories = async (req, res, next) => {
   try {
      const result = await categoryService.getCategories(req.query);

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         ...result,
      });
   } catch (err) {
      next(err);
   }
};

// Get by ID
export const getCategoryById = async (req, res, next) => {
   try {
      const data = await categoryService.getCategoryById(req.params.categoryId);

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data,
      });
   } catch (err) {
      next(err);
   }
};

// Create
export const createCategory = async (req, res, next) => {
   try {
      const data = await categoryService.createCategory(req.body);

      res.status(201).json({
         code: messages.HTTP_STATUS.CREATED.code,
         message: messages.x_created_successfully.replace(
            "%{name}",
            "Category",
         ),
         data,
      });
   } catch (err) {
      next(err);
   }
};

// Update
export const updateCategory = async (req, res, next) => {
   try {
      const data = await categoryService.updateCategory(
         req.params.categoryId,
         req.body,
      );

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_updated_successfully.replace(
            "%{name}",
            "Category",
         ),
         data,
      });
   } catch (err) {
      next(err);
   }
};

// Delete
export const deleteCategory = async (req, res, next) => {
   try {
      const data = await categoryService.deleteCategory(req.params.categoryId);

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_deleted_successfully.replace(
            "%{name}",
            "Category",
         ),
         data,
      });
   } catch (err) {
      next(err);
   }
};
