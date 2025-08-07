import { DataTypes } from "sequelize";
import db from "../config/database.js";

const ordersModel = db.define(
   "orders",
   {
      orderId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      userId: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      total: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      paymentMethod: {
         type: DataTypes.STRING,
         defaultValue: "CASH",
      },
      paymentStatus: {
         type: DataTypes.STRING,
         defaultValue: "unpaid",
      },
   },
   {
      freezeTableName: true,
      timestamps: true,
   }
);

export default ordersModel;
