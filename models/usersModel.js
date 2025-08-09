import { DataTypes } from "sequelize";
import db from "../config/database.js";

const usersModel = db.define(
   "users",
   {
      userId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      name: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      username: {
         type: DataTypes.STRING,
         allowNull: false,
         unique: true,
      },
      password: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      role: {
         type: DataTypes.STRING,
         allowNull: false,
         defaultValue: "admin",
      },
      refreshToken: {
         type: DataTypes.TEXT,
         allowNull: true,
      },
   },
   {
      freezeTableName: true,
      timestamps: true,
   }
);

export default usersModel;
