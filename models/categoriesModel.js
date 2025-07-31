import { DataTypes } from "sequelize";
import db from "../config/database.js";



const categoriesModel = db.define(
   "categories",
   {
      categoryId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      categoryName: {
         type: DataTypes.STRING,
         allowNull: false,
      },
   },
   {
      freezeTableName: true,
      timestamps: true,
   }
);

export default categoriesModel;
