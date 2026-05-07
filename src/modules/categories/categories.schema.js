import Joi from "joi";

export const categorySchema = Joi.object({
    categoryName: Joi.string().trim().min(1).max(100).required(),
});

export const categoryBulkSchema = Joi.array()
    .items(categorySchema)
    .min(1);