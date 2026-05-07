import { DataTypes } from "sequelize";
import db from "../../config/database.js";

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
         references: {
            model: "orders",
            key: "orderId",
         },
         onDelete: "CASCADE",
      },

      menuId: {
         type: DataTypes.INTEGER,
         allowNull: false,
         references: {
            model: "menus",
            key: "menuId",
         },
         onDelete: "RESTRICT",
      },

      quantity: {
         type: DataTypes.INTEGER,
         allowNull: false,
         validate: {
            min: 1,
         },
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
   },
);

export default orderDetailsModel;
