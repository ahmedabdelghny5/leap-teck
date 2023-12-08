import joi from "joi"
import { generalFields, validateObjectId } from "../../middleware/validation.js"
export const createCategory = {
  body: joi.object().required().keys({
    nameAR: joi.string().required(),
    nameEN: joi.string().required()
  }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({
    ln: joi.string().valid('en', 'ar').required().messages({
      'any.required': 'Language is required.',
      'string.base': 'Language must be a string.',
      'any.only': 'Language must be either "en" or "ar".'
    })
  }),
}
export const updateCategory = {
  body: joi.object().required().keys({
    nameAR: joi.string().required(),
    nameEN: joi.string().required()
  }),
  params: joi.object().required().keys({
    id: generalFields.id
  }),
  query: joi.object().required().keys({
    ln: joi.string().valid('en', 'ar').required().messages({
      'any.required': 'Language is required.',
      'string.base': 'Language must be a string.',
      'any.only': 'Language must be either "en" or "ar".'
    })
  }),
}


export const getCategories = {
  body: joi.object().required().keys({}),
  params: joi.object().required().keys({
  }),
  query: joi.object().required().keys({
    ln: joi.string().valid('en', 'ar').required().messages({
      'any.required': 'Language is required.',
      'string.base': 'Language must be a string.',
      'any.only': 'Language must be either "en" or "ar".'
    })
  }).unknown(true),
}
/*

export const signup = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}


*/
