import express from "express";
import cors from "cors";
import FileUpload from "express-fileupload";
import db from "./config/database.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

import "./models/index.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import menusRoutes from "./routes/menusRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import orderDetailsRoutes from "./routes/orderDetailsRoutes.js";
import paymentLogsRoutes from "./routes/paymentLogsRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ["http://192.168.0.101:3000"];
app.use(
   cors({
      credentials: true,
      origin: allowedOrigins,
   })
);
app.use(cookieParser());
app.use(express.json());
app.use(FileUpload());

// Sync database
(async () => {
   try {
      // await db.sync({ alter: true });
   } catch (error) {
      console.error("Error syncing database:", error);
   }
})();

// Define routes
const version = "/v1";
app.use(version, categoriesRoutes);
app.use(version, menusRoutes);
app.use(version, ordersRoutes);
app.use(version, orderDetailsRoutes);
app.use(version, paymentLogsRoutes);
app.use(version, usersRoutes);

app.listen(PORT, () =>
   console.log(`Server is now up and running at http://localhost:${PORT}`)
);
