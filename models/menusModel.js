import { DataTypes } from "sequelize";
import db from "../config/database.js";
import categoriesModel from "./categoriesModel.js";

const menusModel = db.define(
   "menus",
   {
      menuId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      menuName: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      menuDescription: {
         type: DataTypes.STRING,
      },
      categoryId: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      price: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      stock: {
         type: DataTypes.INTEGER,
         allowNull: false,
         defaultValue: 0,
      },
      menuImageUrl: {
         type: DataTypes.STRING,
      },
   },
   {
      freezeTableName: true,
      timestamps: true,
   }
);

export default menusModel;
