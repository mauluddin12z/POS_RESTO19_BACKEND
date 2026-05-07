import messages from "../../utils/messages.js";
import * as userService from "./users.service.js";

// Get all users
export const getUsers = async (req, res, next) => {
   try {
      const result = await userService.getAllUsers();

      res.status(200).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         ...result,
      });
   } catch (error) {
      next(error);
   }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
   try {
      const user = await userService.getUserById(req.params.userId);

      res.status(200).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.HTTP_STATUS.OK.message,
         data: user,
      });
   } catch (error) {
      next(error);
   }
};

// Session
export const getSession = async (req, res) => {
   res.status(200).json({
      loggedIn: true,
      user: req.user,
   });
};

// Create user
export const createUser = async (req, res, next) => {
   try {
      const user = await userService.createUser(req.body);

      res.status(201).json({
         code: messages.HTTP_STATUS.CREATED.code,
         message: messages.x_created_successfully.replace(
            "%{name}",
            "User",
         ),
         data: user,
      });
   } catch (error) {
      next(error);
   }
};

// Update user
export const updateUser = async (req, res, next) => {
   try {
      const user = await userService.updateUser(req.params.userId, req.body);

      res.status(200).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_updated_successfully.replace(
            "%{name}",
            "User",
         ),
         data: user,
      });
   } catch (error) {
      next(error);
   }
};

// Delete user
export const deleteUser = async (req, res, next) => {
   try {
      await userService.deleteUser(req.params.userId);

      res.status(200).json({
         code: messages.HTTP_STATUS.OK.code,
         message: messages.x_deleted_successfully.replace(
            "%{name}",
            "User",
         ),
         data: user,
      });
   } catch (error) {
      next(error);
   }
};
