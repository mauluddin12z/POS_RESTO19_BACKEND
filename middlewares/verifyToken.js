import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const verifyToken = (req, res, next) => {
   const token = req.cookies?.accessToken;
   if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
   }
   jwt.verify(token, JWT_ACCESS_SECRET, (err, decoded) => {
      if (err) {
         return res.status(403).json({ message: "Invalid or expired token" });
      }
      req.user = decoded;
      next();
   });
};
