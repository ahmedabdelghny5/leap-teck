import joi from 'joi';
import { Types } from 'mongoose';

export const createReviewVal = {
    body: joi.object().required().keys({
        comment: joi.string().required(),
        rate: joi.number().required().min(0).max(5),
        mealId: joi.custom((value, helper) => {
            if (Types.ObjectId.isValid(value)) {
                return true;
            } else {
                return helper.message('invalid meal id')
            }
        }),
        chefId: joi.custom((value, helper) => {
            if (Types.ObjectId.isValid(value)) {
                return true;
            } else {
                return helper.message('invalid chef id')
            }
        })
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

export const updateReviewVal = {
    body: joi.object().required().keys({
        comment: joi.string().required(),
        rate: joi.number().required().min(0).max(5),

    }),
    params: joi.object().required().keys({
        id: joi.custom((value, helper) => {
            if (Types.ObjectId.isValid(value)) {
                return true;
            } else {
                return helper.message('invalid review id')
            }
        }).required()
    }),
    query: joi.object().required().keys({
        ln: joi.string().valid('en', 'ar').required().messages({
            'any.required': 'Language is required.',
            'string.base': 'Language must be a string.',
            'any.only': 'Language must be either "en" or "ar".'
        })
    }),
}