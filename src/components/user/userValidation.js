import joi from 'joi';


export const signup = {
    body: joi.object().required().keys({
        name: joi.string().required().min(3).max(20),
        phone: joi.string().required().min(10).max(11),
        email: joi.string().required().email(),
        password: joi.string().required().min(6).max(20),
        confirmPassword: joi.string().required().valid(joi.ref('password')),
        location: joi.string().required().custom((value, helpers) => {
            try {
                const locationObj = JSON.parse(value);
                const schema = joi.object().keys({
                    name: joi.string().required(),
                    address: joi.string().required(),
                    coordinates: joi.array()
                        .items(joi.number().required())
                        .length(2)
                        .required()
                });
                const { error } = schema.validate(
                    locationObj
                );
                if (error) {
                    return helpers.error(error);
                }
                return locationObj;
            } catch (err) {
                return helpers.error(err);
            }
        }),
        profilePic: joi.any(),
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({
        ln: joi.string().valid('en', 'ar').required().messages({
            'any.required': 'Language is required.',
            'string.base': 'Language must be a string.',
            'any.only': 'Language must be either "en" or "ar".'
        })
    }),
    files: joi.object().required().keys({
        profilePic: joi.array().items({
            fieldname: joi.string().required(),
            originalname: joi.string().required(),
            encoding: joi.string().required(),
            mimetype: joi.string().required(),
            destination: joi.string().required(),
            filename: joi.string().required(),
            path: joi.string().required(),
            size: joi.number().required(),
        }).max(1),
    }),

}


export const checkEmail = {
    body: joi.object().required().keys({
        email: joi.string().email()
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


export const signIn = {
    body: joi.object().required().keys({
        email: joi.string().required().email(),
        password: joi.string().required().min(6).max(20),
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({
        ln: joi.string().valid('en', 'ar').required().messages({
            'any.required': 'Language is required.',
            'string.base': 'Language must be a string.',
            'any.only': 'Language must be either "en" or "ar".'
        })
    })

}



export const SendCode = {
    body: joi.object().required().keys({
        email: joi.string().required().email()
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


export const changeForgetPass = {
    body: joi.object().required().keys({
        email: joi.string().required().email(),
        password: joi.string().required().min(6).max(20),
        confirmPassword: joi.string().required().valid(joi.ref('password')),
        code: joi.string().required().min(6).max(6)
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

export const changePassSchema = {
    body: joi.object().required().keys({
        oldPass: joi.string().required().min(6).max(20),
        newPass: joi.string().required().min(6).max(20),
        confirmPassword: joi.string().valid(joi.ref('newPass')).required()
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


export const updateUser = {
    body: joi.object().required().keys({
        name: joi.string().min(3).max(20),
        phone: joi.string().min(10).max(11),
        location: joi.string().custom((value, helpers) => {
            try {
                const locationObj = JSON.parse(value);
                const schema = joi.object().keys({
                    name: joi.string().required(),
                    address: joi.string().required(),
                    coordinates: joi.array()
                        .items(joi.number().required())
                        .length(2)
                        .required()
                });
                const { error } = schema.validate(
                    locationObj
                );
                if (error) {
                    return helpers.error(error);
                }
                return locationObj;
            } catch (err) {
                return helpers.error(err);
            }
        }),
        profilePic: joi.any()
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({
        ln: joi.string().valid('en', 'ar').required().messages({
            'any.required': 'Language is required.',
            'string.base': 'Language must be a string.',
            'any.only': 'Language must be either "en" or "ar".'
        })
    }),
    files: joi.object().required().keys({
        profilePic: joi.array().items({
            fieldname: joi.string().required(),
            originalname: joi.string().required(),
            encoding: joi.string().required(),
            mimetype: joi.string().required(),
            destination: joi.string().required(),
            filename: joi.string().required(),
            path: joi.string().required(),
            size: joi.number().required(),
        }).max(1),
    }),

}


export const deleteUser = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({
        id: joi.string().max(24).min(24).required(),
        ln: joi.string().valid('en', 'ar').required().messages({
            'any.required': 'Language is required.',
            'string.base': 'Language must be a string.',
            'any.only': 'Language must be either "en" or "ar".'
        })
    }),
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

export const addToFavorite = {
    body: joi.object().required().keys({}),
    params: joi.object().required().keys({
        mealId: joi.string().max(24).min(24).required()
    }),
    query: joi.object().required().keys({
        ln: joi.string().valid('en', 'ar').required().messages({
            'any.required': 'Language is required.',
            'string.base': 'Language must be a string.',
            'any.only': 'Language must be either "en" or "ar".'
        })
    }),

}