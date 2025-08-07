import { DataTypes } from "sequelize";
import db from "../config/database.js";

const paymentLogsModel = db.define(
   "paymentLogs",
   {
      paymentLogId: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      orderId: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      amountPaid: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      changeReturned: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
   },
   {
      freezeTableName: true,
      timestamps: true,
   }
);

export default paymentLogsModel;
