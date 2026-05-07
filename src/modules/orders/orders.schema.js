import Joi from "joi";

const orderItemSchema = Joi.object({
    menuId: Joi.number()
        .integer()
        .positive()
        .required(),

    quantity: Joi.number()
        .integer()
        .positive()
        .required(),

    notes: Joi.string()
        .max(500)
        .allow("", null),
});

export const createOrderSchema = Joi.object({
    userId: Joi.number()
        .integer()
        .positive()
        .required(),

    paymentMethod: Joi.string()
        .uppercase()
        .valid("CASH", "QRIS", "BANK")
        .allow(null, ''),

    paymentStatus: Joi.string()
        .valid("unpaid", "paid")
        .default("unpaid"),

    items: Joi.array()
        .items(orderItemSchema)
        .min(1)
        .required(),
});

export const updateOrderSchema = Joi.object({
    paymentMethod: Joi.string()
        .uppercase()
        .valid("CASH", "QRIS", "BANK").allow(null, ''),

    paymentStatus: Joi.string()
        .valid("pending", "paid").allow(null, ''),

    items: Joi.array()
        .items(orderItemSchema)
        .min(1)
});
export const paymentSchema = Joi.object({
    paymentMethod: Joi.string()
        .uppercase()
        .valid("CASH", "QRIS", "BANK").required(),

    paymentStatus: Joi.string()
        .valid("pending", "paid").required(),
});
