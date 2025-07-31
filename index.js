import express from "express";
import cors from "cors";
import FileUpload from "express-fileupload";
import db from "./config/database.js";
import dotenv from "dotenv";
dotenv.config();

import "./models/index.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import menusRoutes from "./routes/menusRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import saleDetailsRoutes from "./routes/saleDetailsRoutes.js";
import paymentLogsRoutes from "./routes/paymentLogsRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(FileUpload());

// Sync database
(async () => {
   try {
      // await db.sync({ force: true });
   } catch (error) {
      console.error("Error syncing database:", error);
   }
})();

// Define routes
const version = "/v1";
app.use(version, categoriesRoutes);
app.use(version, menusRoutes);
app.use(version, salesRoutes);
app.use(version, saleDetailsRoutes);
app.use(version, paymentLogsRoutes);
app.use(version, usersRoutes);

app.listen(PORT, () =>
   console.log(`Server is now up and running at http://localhost:${PORT}`)
);
