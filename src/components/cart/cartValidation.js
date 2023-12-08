import joi from 'joi';



export const addToCart = {
    body: joi.object().required().keys({
        mealDetails: joi.object({
            meal: joi.string().max(24).min(24).required(),
            quantity: joi.number().min(1).max(20).required()
        }).required(),
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({ln: joi.string().valid('en', 'ar').required().messages({
        'any.required': 'Language is required.',
        'string.base': 'Language must be a string.',
        'any.only': 'Language must be either "en" or "ar".'
    })}),
}


export const updateCartVal = {
    body: joi.object().required().keys({
        quantity: joi.number().min(1).max(20).required()
    }),
    params: joi.object().required().keys({
        id: joi.string().max(24).min(24).required()
    }),
    query: joi.object().required().keys({ln: joi.string().valid('en', 'ar').required().messages({
        'any.required': 'Language is required.',
        'string.base': 'Language must be a string.',
        'any.only': 'Language must be either "en" or "ar".'
    })}),
}


export const deleteMealFromCart = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({
        mealId: joi.string().max(24).min(24).required()
    }),
    query: joi.object().required().keys({ln: joi.string().valid('en', 'ar').required().messages({
        'any.required': 'Language is required.',
        'string.base': 'Language must be a string.',
        'any.only': 'Language must be either "en" or "ar".'
    })}),
}