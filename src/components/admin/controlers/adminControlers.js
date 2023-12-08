import chefModel from "../../../../DB/models/chefModel.js"
import ErrorClass from '../../../utils/ErrorClass.js';
import bcrypt from 'bcryptjs'
import crypto from "crypto-js";
import {
    StatusCodes
} from 'http-status-codes';
import cloudinary from "../../../utils/cloudinary.js";
import { nanoid } from "nanoid";
import { createHtml, sendEmail } from "../../../utils/sendEmail.js";
import jwt from 'jsonwebtoken';
import adminModel from "../../../../DB/models/adminModel.js";
import mealModel from './../../../../DB/models/mealModel.js';
import { roles } from "../../../middleware/auth.js";
import { ApiFeatures } from './../../../utils/apiFeatures.js';
import { allMessages } from './../../../utils/localizationHelper.js';



export const admin = async (req, res) => {
    res.json({ message: "This is admin url" })
}

export const addAdmin = async (req, res, next) => {

    let { name, phone, email, password } = req.body
    //* parse location object after coming from form data to convert it from string to object
    //*check if email exists
    const isExist = await adminModel.findOne({ email })
    if (isExist && isExist.confirmed) {
        return next(new ErrorClass(allMessages[req.query.ln].EMAIL_EXIST, 400))
    }
    if (isExist && !isExist.confirmed) {
        return next(new ErrorClass(allMessages[req.query.ln].EMAIL_EXIST_NOT_CONFIRMED, 400))
    }

    //* hash password and encrypt phone
    password = bcrypt.hashSync(password, -process.env.salt)
    phone = crypto.AES.encrypt(phone, process.env.encryption).toString()



    let profilePic
    if (req.files.profilePic) {
        profilePic = await cloudinary.uploader.upload(req.files.profilePic[0].path, {
            folder: `profilePic/${req.files.profilePic[0].originalname + nanoid()}`,
            public_id: req.files.profilePic[0].originalname + nanoid(),
            use_filename: true,
            unique_filename: true,
            resource_type: "auto"
        })
    }
    const admin = new adminModel({
        name,
        phone,
        email,
        password,
        profilePic: profilePic?.secure_url
    })

    //* 1=> create token 
    const payload = {
        email
    }
    const token = jwt.sign(payload, process.env.tokenKey)


    const link = `${req.protocol}://${req.headers.host}/api/v1/admin/confirm/${token}?ln=en`
    const object = `                                                    
    <td align="center" style="border-radius: 3px;" bgcolor="#ED9728"><a
      href="${link}" target="_blank"
      style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #ED9728; display: inline-block;">Confirm
      Account</a>
    </td>
  `
    let html = createHtml(object)
    await sendEmail(email, "Email confirmation", html)
    await admin.save()
    res.json({ value: admin });
}


export const confirmEmail = async (req, res) => {
    const token = req.params.token;
    const tokenDetails = jwt.verify(token, process.env.tokenKey)
    const user = await adminModel.findOneAndUpdate({ email: tokenDetails.email }, { confirmed: true }, { new: true }).select('-password')
    if (!user) {
        return res.status(404).json({ message: allMessages[req.query.ln].USER_NOT_EXIST });
    }
    res.json({ message: allMessages[req.query.ln].SUCCESS });
}

export const emailCheck = async (req, res, next) => {
    const { email } = req.body;
    const isExist = await adminModel.findOne({ email })
    if (isExist) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_VALID_ACCOUNT, 400))
    }
    res.status(201).json({ message: allMessages[req.query.ln].VALID_ACCOUNT })
}

export const changeOldPassword = async (req, res, next) => {
    const { oldPass, newPass } = req.body;
    const id = req.user.id
    let user = await adminModel.findById(id);
    const correctPass = bcrypt.compareSync(oldPass, user.password)
    if (!correctPass) {
        return next(new ErrorClass(allMessages[req.query.ln].FAIL_PASS, StatusCodes.BAD_REQUEST))
    }
    const samePass = bcrypt.compareSync(newPass, user.password)
    if (samePass) {
        return next(new ErrorClass(allMessages[req.query.ln].PASSWORD_SAME_AS_OLD_PASSWORD, StatusCodes.BAD_REQUEST))
    }
    const newPassHashed = bcrypt.hashSync(newPass, -process.env.salt)
    await adminModel.findByIdAndUpdate(id, { password: newPassHashed }, { new: true })
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
}

export const signIn = async (req, res, next) => {
    const { email, password } = req.body;
    const isExist = await adminModel.findOne({ email });
    if (!isExist) {
        return next(new ErrorClass(allMessages[req.query.ln].FAIL_LOGIN, StatusCodes.BAD_REQUEST));
    }
    if (!isExist.confirmed) {
        return next(new ErrorClass(allMessages[req.query.ln].EMAIL_NOT_CONFIRMED, StatusCodes.BAD_REQUEST));

    }
    const pass = bcrypt.compareSync(password, isExist.password)
    if (!pass) {
        return next(new ErrorClass(allMessages[req.query.ln].FAIL_LOGIN, StatusCodes.BAD_REQUEST));
    }
    // token 
    const payload = {
        id: isExist._id,
        email: isExist.email,
        name: isExist.name
    }
    await adminModel.updateOne({ _id: isExist._id }, { isLoggedIn: true })
    const token = jwt.sign(payload, process.env.tokenKey)
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS, token })
}

export const SendCode = async (req, res, next) => {
    const { email } = req.body;
    const user = await adminModel.findOne({ email })
    if (!user) {
        return next(new ErrorClass(allMessages[req.query.ln].USER_NOT_EXIST, StatusCodes.NOT_FOUND))
    }
    if (!user.confirmed) {
        return next(new ErrorClass(allMessages[req.query.ln].EMAIL_NOT_CONFIRMED, StatusCodes.FORBIDDEN))
    }
    const min = 100000;
    const max = 999999;
    const code = Math.floor(Math.random() * (max - min + 1)) + min;
    await adminModel.updateOne({ _id: user._id }, { code })
    const subject = "reset password"
    const html = `  
    <p 
    style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #000000; text-decoration: none; color: #000000;
    text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #ED9728; display: inline-block;">Use this code to reset your password
  </p>
                         
         <p 
            style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #000000; text-decoration: none; color: #000000;
            text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #ED9728; display: inline-block;">${code}
       </p>
  `

    await sendEmail(user.email, subject, html)

    res.json({ message: allMessages[req.query.ln].CHECK_YOUY_INBOX })
}

export const changePass = async (req, res, next) => {
    const { email, code, password } = req.body;
    const user = await adminModel.findOne({ email })
    if (!user) {
        return next(new ErrorClass(allMessages[req.query.ln].USER_NOT_EXIST, StatusCodes.NOT_FOUND))
    }
    if (user.code != code) {
        return next(new ErrorClass(allMessages[req.query.ln].INVALID_CODE, StatusCodes.FORBIDDEN))
    }
    const hashedPass = bcrypt.hashSync(password, 5);
    const min = 100000;
    const max = 999999;
    const newcode = Math.floor(Math.random() * (max - min + 1)) + min;

    await adminModel.findByIdAndUpdate(user._id, { password: hashedPass, code: newcode })
    return res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
}


export const getChefs = async (req, res, next) => {
    const { status } = req.query;
    const topic = {
        pending: { status: 'pending', confirmed: true },
        accepted: { status: 'accepted', confirmed: true },
        rejected: { status: 'rejected', confirmed: true },
        all: { confirmed: true },
    }
    const query = chefModel.find(topic[status]).select('name profilePic email phone status online rate brandName')
    const api = new ApiFeatures(query, req.query)
        .pagination()
        .search()
        .select()
        .sort()
        .filter()
    const chefs = await api.mongooseQuery
    res.json({ chefs })

}

export const dealWithChefRequest = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.query;
    const chef = await chefModel.findOneAndUpdate({ _id: id, status: 'pending' }, { status });
    if (!chef) {
        return next(new ErrorClass(allMessages[req.query.ln].USER_NOT_EXIST, StatusCodes.NOT_FOUND))
    }
    return res.json({ message: allMessages[req.query.ln].SUCCESS })
}

export const getmeals = async (req, res, next) => {
    const { status } = req.query;
    const topic = {
        pending: { status: 'pending' },
        accepted: { status: 'accepted' },
        rejected: { status: 'rejected' },
        all: {},
    }
    const query = mealModel.find(topic[status]).populate([{
        path: 'chefId',
        select: 'name email phone'
    },{
        path:'category'
    }])
    const api = new ApiFeatures(query, req.query)
        .pagination()
        .search()
        .select()
        .sort()
        .filter()
    const meals = await api.mongooseQuery
    res.json({ meals })

}

export const dealWithMealsRequest = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.query;
    const meal = await mealModel.findOneAndUpdate({ _id: id, status: 'pending' }, { status });
    if (!meal) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, StatusCodes.NOT_FOUND))
    }
    return res.json({ message: allMessages[req.query.ln].SUCCESS })
}

export const updateAdmin = async (req, res, next) => {
    const id = req.user._id;
    let { name, phone } = req.body;
    if (phone) {
        phone = crypto.AES.encrypt(phone, process.env.encryption).toString()
    }

    let profilePic
    if (req.files.profilePic) {
        profilePic = await cloudinary.uploader.upload(req.files.profilePic[0].path, {
            folder: `profilePic/${req.files.profilePic[0].originalname + nanoid()}`,
            public_id: req.files.profilePic[0].originalname + nanoid(),
            use_filename: true,
            unique_filename: true,
            resource_type: "auto"
        })
    }

    await adminModel.updateMany({ _id: id }, { name, phone, profilePic: profilePic?.secure_url })
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
}

export const deleteAdmin = async (req, res, next) => {
    const { id } = req.params;
    const admin = await adminModel.findById(id);
    if (!admin) {
        return next(new ErrorClass(allMessages[req.query.ln].USER_NOT_EXIST, StatusCodes.NOT_FOUND))
    }
    if (admin.role == roles.superAdmin) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_AUTHORIZED, StatusCodes.FORBIDDEN))
    }
    await adminModel.deleteOne({ _id: id })
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS, admin })
}

export const logout = async (req, res) => {
    const id = req.user._id;
    await adminModel.updateOne({ _id: id }, { isLoggedIn: false })
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
}