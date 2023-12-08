import {
    StatusCodes
} from 'http-status-codes';
import joi from 'joi'
import { Types } from 'mongoose'

import ErrorClass from '../utils/ErrorClass.js';
import { allMessages } from '../utils/localizationHelper.js';
export const validateObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message('In-valid objectId')
}
export const generalFields = {

    email: joi.string().email({
        minDomainSegments: 2,
        maxDomainSegments: 4,
        tlds: { allow: ['com', 'net'] }
    }).required(),
    password: joi.string(),
    cPassword: joi.string().required(),
    id: joi.string().custom(validateObjectId).required(),
    name: joi.string(),
    file: joi.object({
        size: joi.number().positive().required(),
        path: joi.string().required(),
        filename: joi.string().required(),
        destination: joi.string().required(),
        mimetype: joi.string().required(),
        encoding: joi.string().required(),
        originalname: joi.string().required(),
        fieldname: joi.string().required()
    })
}

const dateMethods = ['body', 'params', 'query', 'files']
const validation = (valSchema) => {
    return (req, res, next) => {
        const validationError = []
        dateMethods.forEach((method) => {
            if (valSchema[method]) {
                let validationRes = valSchema[method].validate(req[method], { abortEarly: false })
                if (validationRes.error) {
                    validationError.push(validationRes.error.details)
                }
            }

        })
        if (!validationError.length) {
            next()
        } else {
            const messages = []
            validationError.forEach(error => {
                error.map(err => {
                    messages.push(err.message)
                })
            });
            res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.BAD_REQUEST,
                ErrorMessage: allMessages.en.VALIDATION_ERROR,
                Error: messages
            })

        }
    }
}
export default validation