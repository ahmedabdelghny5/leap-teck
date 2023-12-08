import joi from "joi"
import { Types } from "mongoose"
import { validateObjectId } from "../../middleware/validation.js";

export const addMealVal = {
  body: joi.object().required().keys({
    name: joi.string().required(),
    description: joi.string().required(),
    price: joi.number().required(),
    category: joi.custom((value, helper) => {
      if (Types.ObjectId.isValid(value)) {
        return true;
      } else {
        return helper.message('invalid category id')
      }
    }).required(),
    howToSell: joi.string().valid('number', 'quantity'),
    mealImages: joi.any()
  }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({
    ln: joi.string().valid('en', 'ar').required().messages({
      'any.required': 'Language is required.',
      'string.base': 'Language must be a string.',
      'any.only': 'Language must be either "en" or "ar".'
    })
  }),
  files: joi.array().required().items(
    joi.object().keys({
      fieldname: joi.string().required(),
      originalname: joi.string().required(),
      encoding: joi.string().required(),
      mimetype: joi.string().required(),
      destination: joi.string().required(),
      filename: joi.string().required(),
      path: joi.string().required(),
      size: joi.number().required(),
    }
    ),
  ).max(4),
}

export const updateMealVal = {
  body: joi.object().required().keys({
    name: joi.string(),
    description: joi.string(),
    price: joi.number(),
    category: joi.string().valid('Beef', 'Chicken', 'Fish', 'Seafood', 'Lamb', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Breakfast', 'Lunch', 'Dinner', 'Appetizers', 'Salads', 'Soups', 'Sandwiches', 'Pasta', 'Pizza', 'Rice dishes', 'Stir-fries', 'Curries', 'Desserts', 'Baked goods', 'Snacks'),
    mealImages: joi.any()
  }),
  params: joi.object().required().keys({
    id: joi.string().max(24).min(24).required()
  }),
  query: joi.object().required().keys({
    ln: joi.string().valid('en', 'ar').required().messages({
      'any.required': 'Language is required.',
      'string.base': 'Language must be a string.',
      'any.only': 'Language must be either "en" or "ar".'
    })
  }),
  files: joi.array().required().items(
    joi.object().keys({
      fieldname: joi.string().required(),
      originalname: joi.string().required(),
      encoding: joi.string().required(),
      mimetype: joi.string().required(),
      destination: joi.string().required(),
      filename: joi.string().required(),
      path: joi.string().required(),
      size: joi.number().required(),
    }
    ),
  ).max(4),

}

export const idOnly = {
  body: joi.object().required().keys({}),
  params: joi.object().required().keys({
    id: joi.string().max(24).min(24).required()
  }),
  query: joi.object().required().keys({
    ln: joi.string().valid('en', 'ar').required().messages({
      'any.required': 'Language is required.',
      'string.base': 'Language must be a string.',
      'any.only': 'Language must be either "en" or "ar".'
    })
  }),

}

export const chefId = {
  body: joi.object().required().keys({}),
  params: joi.object().required().keys({
    chefId: joi.string().max(24).min(24).required()
  }),
  query: joi.object().required().keys({
    ln: joi.string().valid('en', 'ar').required().messages({
      'any.required': 'Language is required.',
      'string.base': 'Language must be a string.',
      'any.only': 'Language must be either "en" or "ar".'
    })
  }),

}


export const meal = {
  body: joi.object().required().keys({}),
  params: joi.object().required().keys({
    categoryId: joi.string().custom(validateObjectId)
  }),
  query: joi.object().required().keys({
    ln: joi.string().valid('en', 'ar').required().messages({
      'any.required': 'Language is required.',
      'string.base': 'Language must be a string.',
      'any.only': 'Language must be either "en" or "ar".'
    })
  }),
}


/*

export const signup = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}


*/
