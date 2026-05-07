import Joi from "joi";

export const createPaymentLogSchema = Joi.object({
    orderId: Joi.number().integer().required(),
    amount: Joi.number().min(0).required(),
    paymentMethod: Joi.string().valid("cash", "card", "qris", "transfer").required(),
    status: Joi.string().valid("success", "failed", "pending").required(),
    reference: Joi.string().allow("", null),
});