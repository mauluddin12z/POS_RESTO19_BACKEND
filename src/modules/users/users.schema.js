import Joi from "joi";

export const createUserSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    username: Joi.string().alphanum().min(3).max(50).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("admin", "cashier", "user").required(),
});

export const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(100),
    username: Joi.string().alphanum().min(3).max(50),
    password: Joi.string().min(6),
    role: Joi.string().valid("admin", "cashier", "user"),
});