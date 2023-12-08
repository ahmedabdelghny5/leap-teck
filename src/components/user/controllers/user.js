import { StatusCodes } from "http-status-codes"
import userModel from "../../../../DB/models/userModel.js"
import ErrorClass from "../../../utils/ErrorClass.js"
import bcrypt from 'bcryptjs'
import crypto from "crypto-js";
import cartModel from "../../../../DB/models/cartModel.js";
import jwt from 'jsonwebtoken';
import cloudinary from "../../../utils/cloudinary.js";
import { nanoid } from "nanoid";
import { createHtml, sendEmail } from "../../../utils/sendEmail.js";
import { roles } from "../../../middleware/auth.js";
import mealModel from './../../../../DB/models/mealModel.js';
import { allMessages } from "../../../utils/localizationHelper.js";

export const mainUser = async (req, res) => {
    res.json({ message: "This is user url" })
}





export const signup = async (req, res, next) => {
    let { name, email, password, phone, location } = req.body

    const isExist = await userModel.findOne({ email })
    if (isExist && isExist.confirmed) {
        return next(new ErrorClass(allMessages[req.query.ln].EMAIL_EXIST, 400))
    }
    if (isExist && !isExist.confirmed) {
        return next(new ErrorClass(allMessages[req.query.ln].EMAIL_EXIST_NOT_CONFIRMED, 400))
    }
    location = JSON.parse(location)

    const newLocation = {
        type: 'Point',
        coordinates: [location.coordinates[1], location.coordinates[0]]
    }

    //* hash password and encrypt phone
    password = bcrypt.hashSync(password, -process.env.salt)
    phone = crypto.AES.encrypt(phone, process.env.encryption).toString()

    //* upload images to cloudinary
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

    const user = new userModel({
        name,
        phone,
        email,
        password,
        location: newLocation,
        profilePic: profilePic?.secure_url
    })

    //* 1=> create token 
    const payload = {
        email
    }
    const token = jwt.sign(payload, process.env.tokenKey)


    const link = `${req.protocol}://${req.headers.host}/api/v1/user/confirm/${token}?ln=en`
    const object = `                                                    
    <td align="center" style="border-radius: 3px;" bgcolor="#ED9728"><a
      href="${link}" target="_blank"
      style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #ED9728; display: inline-block;">Confirm
      Account</a>
    </td>
  `
    let html = createHtml(object)

    await sendEmail(email, "Email confirmation", html)


    const userCart = new cartModel({ userId: user._id })
    await userCart.save()

    await user.save()


    res.json({ message: allMessages.ar.CHECK_YOUY_INBOX });
}

export const confirmEmail = async (req, res) => {
    const token = req.params.token;
    const tokenDetails = jwt.verify(token, process.env.tokenKey)
    const user = await userModel.findOneAndUpdate({ email: tokenDetails.email }, { confirmed: true }, { new: true }).select('-password')
    if (!user) {
        return res.status(404).json({ message: allMessages[req.query.ln].NOT_FOUND });
    }
    res.json({ message: allMessages[req.query.ln].SUCCESS });
}

export const emailCheck = async (req, res, next) => {
    const { email } = req.body;
    const isExist = await userModel.findOne({ email })
    if (isExist) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_VALID_ACCOUNT, 400))
    }
    res.status(201).json({ message: allMessages[req.query.ln].VALID_ACCOUNT })
}

export const signIn = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email })
    if (!user) {
        return next(new ErrorClass(allMessages[req.query.ln].FAIL_LOGIN, StatusCodes.FORBIDDEN))
    }
    if (!user.confirmed) {
        return next(new ErrorClass(allMessages[req.query.ln].EMAIL_NOT_CONFIRMED, StatusCodes.FORBIDDEN))
    }
    const isMatch = bcrypt.compareSync(password, user.password)
    if (!isMatch) {
        return next(new ErrorClass(allMessages[req.query.ln].FAIL_LOGIN, StatusCodes.FORBIDDEN))
    }
    const payload = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
    }
    await userModel.updateOne({ _id: user._id }, { isLoggedIn: true })

    const token = jwt.sign(payload, process.env.tokenKey)
    res.status(200).json({ message: allMessages[req.query.ln].SUCCESS, token })
}

export const changeOldPassword = async (req, res, next) => {
    const { oldPass, newPass } = req.body;
    const id = req.user.id
    let user = await userModel.findById(id);
    const correctPass = bcrypt.compareSync(oldPass, user.password)
    if (!correctPass) {
        return next(new ErrorClass(allMessages[req.query.ln].FAIL_PASS, StatusCodes.BAD_REQUEST))
    }
    const samePass = bcrypt.compareSync(newPass, user.password)
    if (samePass) {
        return next(new ErrorClass(allMessages[req.query.ln].PASSWORD_SAME_AS_OLD_PASSWORD, StatusCodes.BAD_REQUEST))
    }
    const newPassHashed = bcrypt.hashSync(newPass, -process.env.salt)
    await userModel.findByIdAndUpdate(id, { password: newPassHashed }, { new: true })
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
}


export const SendCode = async (req, res, next) => {
    const { email } = req.body;
    const user = await userModel.findOne({ email })
    if (!user) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, StatusCodes.NOT_FOUND));

    }
    if (!user.confirmed) {
        return next(new ErrorClass(allMessages[req.query.ln].EMAIL_NOT_CONFIRMED, StatusCodes.FORBIDDEN));

    }
    const min = 100000;
    const max = 999999;
    const code = Math.floor(Math.random() * (max - min + 1)) + min;
    await userModel.updateOne({ _id: user._id }, { code })
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
    const user = await userModel.findOne({ email })
    if (!user) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, StatusCodes.NOT_FOUND));

    }
    if (user.code != code) {
        return next(new ErrorClass(allMessages[req.query.ln].INVALID_CODE, StatusCodes.FORBIDDEN));

    }
    const hashedPass = bcrypt.hashSync(password, 5);
    const min = 100000;
    const max = 999999;
    const newcode = Math.floor(Math.random() * (max - min + 1)) + min;

    await userModel.findByIdAndUpdate(user._id, { password: hashedPass, code: newcode })
    return res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
}

export const updateUser = async (req, res, next) => {
    let { name, phone, location } = req.body
    const userId = req.user._id
    location = JSON.parse(location)
    const newLocation = {
        type: 'Point',
        coordinates: [location.coordinates[1], location.coordinates[0]]
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

    phone = crypto.AES.encrypt(phone, process.env.encryption).toString()

    await userModel.findByIdAndUpdate(
        userId,
        {
            name,
            phone,
            location: newLocation,
            profilePic: profilePic?.secure_url
        })
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })

}

export const deleteUser = async (req, res, next) => {
    const { id } = req.query
    if (req.user.role == roles.admin || req.user.role == roles.superAdmin || req.user._id == id) {
        const deleted = await userModel.findByIdAndDelete(id);
        if (deleted) {
            await cartModel.deleteOne({ userId: deleted._id })
            return res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
        } else {
            return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, StatusCodes.NOT_FOUND))
        }

    } else {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_AUTHORIZED, StatusCodes.FORBIDDEN))
    }
}



export const logout = async (req, res) => {
    const id = req.user._id;
    await userModel.updateOne({ _id: id }, { isLoggedIn: false })
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
}

export const getUserData = async (req, res, next) => {
    const id = req.params.id;
    const userId = req.user._id

    const user = await userModel.findById(userId).select('-password -confirmed -code -role -isLoggedIn -updatedAt -__v').populate([{
        path: "favorites",
        select: "-updatedAt -__v",
        populate: {
            path: "chefId",
            select: "name phone brandName profilePic"
        }
    }]);
    console.log({ user });
    if (!user) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, StatusCodes.NOT_FOUND))
    }
    if (user.role != roles.admin && user.role != roles.superAdmin && user._id.toString() != userId) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_AUTHORIZED, StatusCodes.UNAUTHORIZED))
    }
    res.status(StatusCodes.ACCEPTED).json({ user })
}

export const addToFavorite = async (req, res, next) => {
    const { mealId } = req.params;
    const user = req.user;
    const meal = await mealModel.findById(mealId);
    if (!meal) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, StatusCodes.NOT_FOUND))
    }
    if (!user.favorites.includes(meal._id.toString())) {
        user.favorites.push(meal._id.toString());
    } else {
        user.favorites = user.favorites.filter(ele => {
            return ele.toString() != meal._id.toString()
        })
    }
    await userModel.updateOne({ _id: user._id }, { favorites: user.favorites })

    res.json({ message: allMessages[req.query.ln].SUCCESS })
}


export const getUserFavorites = async (req, res, next) => {
    const user = req.user;
    console.log({ user });
    const favorites = await userModel.findById(user._id).select('favorites -_id').populate([{
        path: 'favorites',
        populate: [{
            path: 'chefId',
            select: 'name email phone'
        }]
    }])
    res.status(200).json({ message: allMessages[req.query.ln].SUCCESS, favorites: favorites.favorites })
}