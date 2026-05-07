import * as menuService from "./menus.service.js";
import messages from "../../utils/messages.js";

// Get all
export const getMenus = async (req, res, next) => {
   try {
      const result = await menuService.getMenus(req.query);

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
export const getMenuById = async (req, res, next) => {
   try {
      const data = await menuService.getMenuById(req.params.menuId);

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
export const createMenu = async (req, res, next) => {
   try {
      const data = await menuService.createMenu(req.body, req.files);

      res.status(201).json({
         code: messages.HTTP_STATUS.CREATED.code,
         message: messages.x_created_successfully.replace(
            "%{name}",
            "Menu",
         ),
         data,
      });
   } catch (err) {
      next(err);
   }
};

// Update
export const updateMenu = async (req, res, next) => {
   try {
      const data = await menuService.updateMenu(req.params.menuId, req.body, req.files);

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_updated_successfully.replace(
            "%{name}",
            "Menu",
         ),
         data,
      });
   } catch (err) {
      next(err);
   }
};

// Delete
export const deleteMenu = async (req, res, next) => {
   try {
      const data = await menuService.deleteMenu(req.params.menuId);

      res.json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_deleted_successfully.replace(
            "%{name}",
            "Menu",
         ),
         data,
      });
   } catch (err) {
      next(err);
   }
};
