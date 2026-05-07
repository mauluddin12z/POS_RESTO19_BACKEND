import usersModel from "../../users/users.model.js";
import categoriesModel from "../../categories/categories.model.js";
import menusModel from "../../menus/menus.model.js";
import ordersModel from "../../orders/orders.model.js";
import orderDetailsModel from "../../order-details/orderDetails.model.js";
import paymentLogsModel from "../../payment-logs/paymentLogs.model.js";

let initialized = false;

export default function applyAssociations() {
    if (initialized) return;

    initialized = true;

    usersModel.hasMany(ordersModel, { foreignKey: "userId" });
    ordersModel.belongsTo(usersModel, { foreignKey: "userId" });

    categoriesModel.hasMany(menusModel, { foreignKey: "categoryId" });
    menusModel.belongsTo(categoriesModel, { foreignKey: "categoryId" });

    ordersModel.hasMany(orderDetailsModel, { foreignKey: "orderId" });
    orderDetailsModel.belongsTo(ordersModel, { foreignKey: "orderId" });

    menusModel.hasMany(orderDetailsModel, { foreignKey: "menuId" });
    orderDetailsModel.belongsTo(menusModel, { foreignKey: "menuId" });

    ordersModel.hasOne(paymentLogsModel, { foreignKey: "orderId" });
    paymentLogsModel.belongsTo(ordersModel, { foreignKey: "orderId" });
}