import Users from "../models/usersModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import messages from "../utils/messages.js";
import { handleServerError } from "../utils/errorHandler.js";
import dotenv from "dotenv";
dotenv.config();

// Register new user
export const registerUser = async (req, res) => {
   try {
      const { name, username, password, role } = req.body;

      if (!name || !username || !password || !role) {
         return res.status(400).json({
            code: 400,
            message: "All fields are required",
         });
      }

      const existingUser = await Users.findOne({ where: { username } });
      if (existingUser) {
         return res.status(409).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await Users.create({
         name,
         username,
         password: hashedPassword,
         role,
      });

      res.status(201).json({
         code: 201,
         message: "User registered successfully",
         data: {
            userId: user.userId,
            name: user.name,
            username: user.username,
            role: user.role,
         },
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const generateAccessToken = (payload) => {
   return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (payload) => {
   return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const loginUser = async (req, res) => {
   try {
      const { username, password } = req.body;

      const user = await Users.findOne({ where: { username } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
         return res.status(401).json({ message: "Invalid credentials" });
      }

      const payload = { userId: user.userId, role: user.role };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Save refreshToken to DB
      user.refreshToken = refreshToken;
      await user.save();

      res.status(200).json({
         message: "Login successful",
         accessToken,
         refreshToken,
         data: {
            userId: user.userId,
            name: user.name,
            role: user.role,
         },
      });
   } catch (error) {
      handleServerError(error, res);
   }
};

export const logoutUser = async (req, res) => {
   try {
      const { userId } = req.user;

      const user = await Users.findByPk(userId);
      if (user) {
         user.refreshToken = null;
         await user.save();
      }

      res.status(200).json({ message: "Logout successful" });
   } catch (error) {
      handleServerError(error, res);
   }
};

export const refreshToken = async (req, res) => {
   const { refreshToken } = req.body;
   if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
   }

   try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      const user = await Users.findByPk(decoded.userId);

      if (!user || user.refreshToken !== refreshToken) {
         return res.status(403).json({ message: "Invalid refresh token" });
      }

      const newAccessToken = generateAccessToken({
         userId: user.userId,
         role: user.role,
      });

      res.status(200).json({
         message: "Access token refreshed",
         accessToken: newAccessToken,
      });
   } catch (error) {
      return res
         .status(403)
         .json({ message: "Invalid or expired refresh token" });
   }
};
