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

const db = new Sequelize("resto_19_test", "root", "", {
   host: "localhost",
   dialect: "mysql",
   timezone: "+07:00",
});

export default db;
