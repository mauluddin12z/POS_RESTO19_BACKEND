import Joi from "joi";

export const createMenuSchema = Joi.object({
    menuName: Joi.string().min(2).max(150).required(),
    menuDescription: Joi.string().allow("", null),
    categoryId: Joi.number().integer().required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().integer().min(0).required(),
    menuImageUrl: Joi.string().uri().allow("", null),
});

export const updateMenuSchema = Joi.object({
    menuName: Joi.string().min(2).max(150),
    menuDescription: Joi.string().allow("", null),
    categoryId: Joi.number().integer(),
    price: Joi.number().min(0),
    stock: Joi.number().integer().min(0),
    menuImageUrl: Joi.string().uri().allow("", null),
});