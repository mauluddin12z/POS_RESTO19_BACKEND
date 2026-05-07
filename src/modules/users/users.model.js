import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const Users = db.define(
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
         validate: {
            notEmpty: true,
         },
      },

      username: {
         type: DataTypes.STRING,
         allowNull: false,
         unique: true,
         validate: {
            notEmpty: true,
         },
      },

      password: {
         type: DataTypes.STRING,
         allowNull: false,
         validate: {
            notEmpty: true,
         },
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
   },
);

export default Users;
