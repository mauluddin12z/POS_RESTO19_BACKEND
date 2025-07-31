import { DataTypes } from "sequelize";
import db from "../config/database.js";

const salesModel = db.define(
   "sales",
   {
      saleId: {
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
         defaultValue: "cash",
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

export default salesModel;
