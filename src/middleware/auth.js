import jwt from 'jsonwebtoken';
import ErrorClass from '../utils/ErrorClass.js';
import {
    StatusCodes
} from 'http-status-codes';
import adminModel from '../../DB/models/adminModel.js';
import chefModel from '../../DB/models/chefModel.js';
import userModel from '../../DB/models/userModel.js';
import { promisify } from 'util'
import { allMessages } from '../utils/localizationHelper.js';
export const roles = {
    admin: "admin",
    superAdmin: "superAdmin",
    user: "user",
    chef: "chef",
}
Object.freeze(roles)


export const auth = (roles) => {
    return async (req, res, next) => {
        const startToken = req.headers.token;
        if (startToken) {
            if (startToken.startsWith(process.env.tokenStart)) {
                const token = startToken.split(' ')[1]
                const userData = await promisify(jwt.verify)(token, process.env.tokenKey)
                let exist = {
                    user: false,
                    admin: false,
                    chef: false
                }
                let user;

                if (roles.includes("chef")) {
                    user = await chefModel.findById(userData.id).select('-password')
                    if (user) {
                        exist.chef = true
                    }
                }
                if (roles.includes("user") && !user) {

                    user = await userModel.findById(userData.id).select('-password')
                    if (user) {
                        exist.user = true
                    }
                }
                if ((roles.includes("admin") || roles.includes("superAdmin")) && !user) {
                    user = await adminModel.findById(userData.id).select('-password')
                    if (user) {
                        exist.admin = true
                    }
                }
                if (exist.chef || exist.user || exist.admin) {
                    if (!user.confirmed) {
                        return next(new ErrorClass(allMessages[req.query.ln].EMAIL_NOT_CONFIRMED, StatusCodes.BAD_REQUEST));
                    }
                    if (!user.isLoggedIn) {
                        return next(new ErrorClass(allMessages[req.query.ln].LOGIN_FIRST, StatusCodes.BAD_REQUEST));
                    }
                    if (roles.includes(user.role)) {
                        req.user = user
                        next()
                    } else {
                        return next(new ErrorClass(allMessages[req.query.ln].NOT_AUTHORIZED, StatusCodes.UNAUTHORIZED))
                    }
                } else {
                    return next(new ErrorClass(allMessages[req.query.ln].USER_NOT_EXIST, StatusCodes.NOT_FOUND))
                }
            } else {
                return next(new ErrorClass(allMessages[req.query.ln].BEARER_KEY, StatusCodes.NOT_ACCEPTABLE))
            }
        } else {
            return next(new ErrorClass(allMessages[req.query.ln].TOKEN_NOT_EXIST, StatusCodes.NOT_ACCEPTABLE))
        }
    }
}





