import joi from "joi"

const noDateSchema = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({
        ln: joi.string().valid('en', 'ar').required().messages({
            'any.required': 'Language is required.',
            'string.base': 'Language must be a string.',
            'any.only': 'Language must be either "en" or "ar".'
        })
    }).unknown(true),
}

export const confirm = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({
        token:joi.string().required()
    }),
    query: joi.object().required().keys({
        ln: joi.string().valid('en', 'ar').required().messages({
            'any.required': 'Language is required.',
            'string.base': 'Language must be a string.',
            'any.only': 'Language must be either "en" or "ar".'
        })
    }),
}
export default noDateSchema