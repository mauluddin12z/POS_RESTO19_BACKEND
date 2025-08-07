import db from "../config/database.js";
import usersModel from "./usersModel.js";
import categoriesModel from "./categoriesModel.js";
import menusModel from "./menusModel.js";
import ordersModel from "./ordersModel.js";
import orderDetailsModel from "./orderDetailsModel.js";
import paymentLogsModel from "./paymentLogsModel.js";

// Users - Orders
usersModel.hasMany(ordersModel, { foreignKey: "userId" });
ordersModel.belongsTo(usersModel, { foreignKey: "userId" });

// Categories - Menus
categoriesModel.hasMany(menusModel, { foreignKey: "categoryId" });
menusModel.belongsTo(categoriesModel, { foreignKey: "categoryId" });


// Orders - OrderDetails
ordersModel.hasMany(orderDetailsModel, { foreignKey: "orderId" });
orderDetailsModel.belongsTo(ordersModel, { foreignKey: "orderId" });

// Orders - PaymentLogs
ordersModel.hasOne(paymentLogsModel, { foreignKey: "orderId" });
paymentLogsModel.belongsTo(ordersModel, { foreignKey: "orderId" });

// Orders - OrdersDetails
menusModel.hasMany(orderDetailsModel, { foreignKey: "menuId" });
orderDetailsModel.belongsTo(menusModel, { foreignKey: "menuId" });

// Export all the models
export {
   db,
   usersModel,
   categoriesModel,
   menusModel,
   ordersModel,
   orderDetailsModel,
   paymentLogsModel,
};
