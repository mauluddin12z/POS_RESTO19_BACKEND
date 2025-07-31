import { DataTypes } from "sequelize";
import db from "../config/database.js";

const saleDetailsModel = db.define(
   "saleDetails",
   {
      saleDetailId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      saleId: {
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
   },
   {
      freezeTableName: true,
      timestamps: true,
   }
);

export default saleDetailsModel;
