import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import mysql2 from "mysql2";

dotenv.config();

// // Create a new Sequelize instance using the URI
// const db = new Sequelize(process.env.MYSQL_URI, {
//    dialect: "mysql",
//    timezone: "+07:00",
//    dialectModule: mysql2,
// });

// export default db;


const db = new Sequelize(
   process.env.DB_NAME || "resto_19",
   process.env.DB_USER || "root",
   process.env.DB_PASS || "",
   {
      host: process.env.DB_HOST || "localhost",
      dialect: process.env.DB_DIALECT || "mysql",
      timezone: process.env.DB_TIMEZONE || "+07:00",
      dialectModule: mysql2,
   }
);

export default db;
