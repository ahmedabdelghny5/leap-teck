import joi from 'joi';


export const createOrder = {
    body: joi.object().required().keys({
        building: joi.string().required(),
        floor: joi.string().required(),
        apartment: joi.string().required(),
        city: joi.string().required(),
        street: joi.string().required(),
        country: joi.string().required(),
        note: joi.string().required()
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({ln: joi.string().valid('en', 'ar').required().messages({
        'any.required': 'Language is required.',
        'string.base': 'Language must be a string.',
        'any.only': 'Language must be either "en" or "ar".'
    })}),

}


export const getOrders = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({
        orderStatus: joi.string().required().valid('pending', 'done', 'doing', 'refused', 'all'),
        drivenStatus: joi.string().required().valid('cooking', 'waiting', 'in-rood', 'arrived', 'all'),
        ln: joi.string().valid('en', 'ar').required().messages({
            'any.required': 'Language is required.',
            'string.base': 'Language must be a string.',
            'any.only': 'Language must be either "en" or "ar".'
        })
    }).unknown(true),
}
export const changeOrderStatus = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({
        _id: joi.string().required().max(24).min(24)
    }),
    query: joi.object().required().keys({
        orderStatus: joi.string().required().valid('pending', 'done', 'doing', 'refused'),
        ln: joi.string().valid('en', 'ar').required().messages({
            'any.required': 'Language is required.',
            'string.base': 'Language must be a string.',
            'any.only': 'Language must be either "en" or "ar".'
        })
    }),
}


export const changeDrivenStatus = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({
        _id: joi.string().required().max(24).min(24)
    }),
    query: joi.object().required().keys({
        drivenStatus: joi.string().required().valid('cooking', 'waiting', 'in-rood', 'arrived'),
        ln: joi.string().valid('en', 'ar').required().messages({
            'any.required': 'Language is required.',
            'string.base': 'Language must be a string.',
            'any.only': 'Language must be either "en" or "ar".'
        })
    }),
}