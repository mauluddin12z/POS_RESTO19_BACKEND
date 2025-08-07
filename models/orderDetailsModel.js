import { DataTypes } from "sequelize";
import db from "../config/database.js";

const orderDetailsModel = db.define(
   "orderDetails",
   {
      orderDetailId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      orderId: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      menuId: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      quantity: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      price: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      subtotal: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      notes: {
         type: DataTypes.TEXT,
         allowNull: true,
      },
   },
   {
      freezeTableName: true,
      timestamps: true,
   }
);

export default orderDetailsModel;
