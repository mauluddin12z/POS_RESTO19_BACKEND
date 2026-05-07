import jwt from "jsonwebtoken";
import messages from "../../utils/messages.js";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

// Extract token from cookie or header
const extractToken = (req) => {
   const cookieToken = req.cookies?.accessToken;

   const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

   return cookieToken || headerToken;
};

export const verifyToken = (req, res, next) => {
   const token = extractToken(req);

   if (!token) {
      return next({
         status: 401,
         message: messages.HTTP_STATUS.UNAUTHORIZED.message,
      });
   }

   try {
      const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

      req.user = {
         userId: decoded.userId,
         role: decoded.role,
      };

      next();
   } catch (err) {
      return next({
         status: 403,
         message: "Invalid or expired token",
      });
   }
};
