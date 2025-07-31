import Users from "../models/usersModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import messages from "../utils/messages.js";
import { handleServerError } from "../utils/errorHandler.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // simpan di .env

// Register new user
export const registerUser = async (req, res) => {
   try {
      const { name, username, password, role } = req.body;

      if (!username || !password || !role || !name) {
         return res.status(400).json({
            code: 400,
            message: "All fields are required",
         });
      }

      const existingUser = await Users.findOne({ where: { username } });
      if (existingUser) {
         return res.status(409).json({
            code: 409,
            message: "Username already exists",
         });
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

// Login user
export const loginUser = async (req, res) => {
   try {
      const { username, password } = req.body;

      const user = await Users.findOne({ where: { username } });
      if (!user) {
         return res.status(401).json({
            code: 401,
            message: "Invalid credentials",
         });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
         return res.status(401).json({
            code: 401,
            message: "Invalid credentials",
         });
      }

      const token = jwt.sign(
         { userId: user.userId, role: user.role },
         JWT_SECRET,
         { expiresIn: "1d" }
      );

      res.json({
         code: 200,
         message: "Login successful",
         token,
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
