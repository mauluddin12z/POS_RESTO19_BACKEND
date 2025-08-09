import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
// Create a new Sequelize instance using the URI
const db = new Sequelize(process.env.MYSQL_URI, {
   dialect: "mysql",
   timezone: "+07:00",
});

export default db;
