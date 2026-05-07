import Joi from "joi";

export const createOrderDetailSchema = Joi.object({
    orderId: Joi.number().integer().required(),
    menuId: Joi.number().integer().required(),
    price: Joi.number().integer().min(0).required(),
    quantity: Joi.number().integer().min(1).required(),
    subtotal: Joi.number().integer().min(0).required(),
    notes: Joi.string().allow("", null),
});

export const updateOrderDetailSchema = Joi.object({
    price: Joi.number().integer().min(0),
    quantity: Joi.number().integer().min(1),
    subtotal: Joi.number().integer().min(0),
    menuId: Joi.number().integer(),
    notes: Joi.string().allow("", null),
});