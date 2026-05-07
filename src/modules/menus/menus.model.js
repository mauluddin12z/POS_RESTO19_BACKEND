import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const Menus = db.define(
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
         allowNull: true,
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
         allowNull: true,
      },
   },
   {
      freezeTableName: true,
      timestamps: true,
   },
);

export default Menus;
