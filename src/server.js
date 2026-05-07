import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

// Explicit model loading (keep for now, we’ll improve later)
import applyAssociations from "./modules/shared/database/associations.js";
import db from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
   try {
      // DB connection test (better than silent sync)
      await db.authenticate();
      console.log("✅ Database connected");

      // Apply associations
      applyAssociations();

      app.listen(PORT, "0.0.0.0", () => {
         console.log(`🚀 Server running at http://localhost:${PORT}`);
      });
   } catch (error) {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
   }
};

startServer();
