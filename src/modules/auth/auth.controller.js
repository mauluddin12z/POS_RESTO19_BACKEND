import * as authService from "./auth.service.js";
import { setAuthCookies, clearAuthCookies } from "./auth.cookie.js";
import messages from "../../utils/messages.js";

// Register
export const registerUser = async (req, res, next) => {
   try {
      const user = await authService.register(req.body);

      res.status(201).json({
         message: messages.register_success,
         data: user,
      });
   } catch (error) {
      next(error);
   }
};

// Login
export const loginUser = async (req, res, next) => {
   try {
      const { user, accessToken, refreshToken } =
         await authService.login(req.body);

      setAuthCookies(res, accessToken, refreshToken);

      res.status(200).json({
         message: messages.login_success,
         data: user,
      });
   } catch (error) {
      next(error);
   }
};

// Logout
export const logoutUser = async (req, res, next) => {
   try {
      if (!req.user?.userId) {
         return res.status(401).json({
            message: messages.unauthorized,
         });
      }

      await authService.logout(req.user.userId);

      clearAuthCookies(res);

      res.status(200).json({
         message: messages.logout_success,
      });
   } catch (error) {
      next(error);
   }
};

// Refresh
export const refreshToken = async (req, res, next) => {
   try {
      const token = req.cookies?.refreshToken;

      if (!token) {
         return res.status(401).json({
            message: messages.refresh_token_required,
         });
      }

      const { accessToken, refreshToken: newRefreshToken } =
         await authService.refresh(token);

      setAuthCookies(res, accessToken, newRefreshToken);

      res.status(200).json({
         message: messages.token_refreshed,
      });
   } catch (error) {
      next(error);
   }
};
