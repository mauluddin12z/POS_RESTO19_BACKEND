import express from "express";
import cors from "cors";
import FileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import errorHandler from "./utils/errorHandler.js";
import routes from "./routes/index.js";
import { swaggerDocs } from "./docs/swagger.js";

const app = express();
swaggerDocs(app);

// CORS config
const allowedOrigins = process.env.ALLOWED_ORIGINS
   ? process.env.ALLOWED_ORIGINS.split(",")
   : [];

app.use(
   cors({
      credentials: true,
      origin: allowedOrigins,
   }),
);

// Global middlewares
app.use(cookieParser());
app.use(express.json());
app.use(FileUpload());

// API routes
app.use("/api/v1", routes);

// Global error handler (MUST be last)
app.use(errorHandler);

export default app;
