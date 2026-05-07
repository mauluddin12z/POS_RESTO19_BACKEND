import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    username: Joi.string().alphanum().min(3).max(50).required(),
    password: Joi.string().min(6).max(100).required(),
    role: Joi.string().valid("admin", "superadmin").required(),
});

export const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
});