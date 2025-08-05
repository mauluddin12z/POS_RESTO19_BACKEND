import db from "../config/database.js";
import usersModel from "./usersModel.js";
import categoriesModel from "./categoriesModel.js";
import menusModel from "./menusModel.js";
import salesModel from "./salesModel.js";
import saleDetailsModel from "./saleDetailsModel.js";
import paymentLogsModel from "./paymentLogsModel.js";

// Users - Sales
usersModel.hasMany(salesModel, { foreignKey: "userId" });
salesModel.belongsTo(usersModel, { foreignKey: "userId" });

// Categories - Menus
categoriesModel.hasMany(menusModel, { foreignKey: "categoryId" });
menusModel.belongsTo(categoriesModel, { foreignKey: "categoryId" });


// Sales - SaleDetails
salesModel.hasMany(saleDetailsModel, { foreignKey: "saleId" });
saleDetailsModel.belongsTo(salesModel, { foreignKey: "saleId" });

// Sales - PaymentLogs
salesModel.hasOne(paymentLogsModel, { foreignKey: "saleId" });
paymentLogsModel.belongsTo(salesModel, { foreignKey: "saleId" });

// Sales - SaleDetails
menusModel.hasMany(saleDetailsModel, { foreignKey: "menuId" });
saleDetailsModel.belongsTo(menusModel, { foreignKey: "menuId" });

// Export all the models
export {
   db,
   usersModel,
   categoriesModel,
   menusModel,
   salesModel,
   saleDetailsModel,
   paymentLogsModel,
};
