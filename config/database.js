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
   process.env.DB_NAME,
   process.env.DB_USER,
   process.env.DB_PASS,
   {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      timezone: process.env.DB_TIMEZONE,
      dialectModule: mysql2,
   }
);

export default db;
