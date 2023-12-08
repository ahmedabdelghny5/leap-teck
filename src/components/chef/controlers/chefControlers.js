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
import { roles } from "../../../middleware/auth.js";
import mealModel from "../../../../DB/models/mealModel.js";
import cartModel from './../../../../DB/models/cartModel.js';
import { ApiFeatures } from "../../../utils/apiFeatures.js";
import { allMessages } from "../../../utils/localizationHelper.js";



export const chef = async (req, res) => {
    res.json({ message: "This is Chef url" })
}

export const signup = async (req, res, next) => {
    let { name, phone, email, password, location, brandName, workTime, addDetails, minCharge, disc } = req.body
    //* parse location object after coming from form data to convert it from string to object
    //* check if required images attached
    //*check if email exists

    const isExist = await chefModel.findOne({ email })
    console.log(isExist);
    if (isExist && isExist.confirmed) {
        console.log(isExist);
        return next(new ErrorClass(allMessages[req.query.ln].USER_EXIST, 400))
    }
    if (isExist && !isExist.confirmed) {
        return next(new ErrorClass(allMessages[req.query.ln].EMAIL_EXIST_NOT_CONFIRMED, 400))
    }


    //*check if brand name exists
    const brandIsExist = await chefModel.findOne({ brandName })
    console.log(brandIsExist);
    if (brandIsExist) {
        return next(new ErrorClass(allMessages[req.query.ln].BRAND_EXIST, 400))
    }
    location = JSON.parse(location)
    const newLocation = {
        type: 'Point',
        coordinates: [location.coordinates[1], location.coordinates[0]]
    }
    //* hash password and encrypt phone
    password = bcrypt.hashSync(password, -process.env.salt)
    phone = crypto.AES.encrypt(phone, process.env.encryption).toString()
    let test = crypto.AES.decrypt(phone, process.env.encryption).toString()

    //* upload images to cloudinary
    const frontId = await cloudinary.uploader.upload(req.files.frontId[0].path, {
        folder: `front_id/${req.files.frontId[0].originalname + nanoid()}`,
        public_id: req.files.frontId[0].originalname + nanoid(),
        use_filename: true,
        unique_filename: true,
        resource_type: "auto"
    })
    const backId = await cloudinary.uploader.upload(req.files.backId[0].path, {
        folder: `back_id/${req.files.backId[0].originalname + nanoid()}`,
        public_id: req.files.backId[0].originalname + nanoid(),
        use_filename: true,
        unique_filename: true,
        resource_type: "auto"
    })
    let healthCertificate
    if (req.files.healthCertificate) {
        healthCertificate = await cloudinary.uploader.upload(req.files.healthCertificate[0].path, {
            folder: `healthCertificate/${req.files.healthCertificate[0].originalname + nanoid()}`,
            public_id: req.files.healthCertificate[0].originalname + nanoid(),
            use_filename: true,
            unique_filename: true,
            resource_type: "auto"
        })

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

    const chef = new chefModel({
        name,
        phone,
        email,
        password,
        location: newLocation,
        brandName,
        workTime,
        addDetails,
        minCharge,
        disc,
        profilePic: profilePic?.secure_url,
        frontId: frontId?.secure_url,
        backId: backId?.secure_url,
        healthCertificate: healthCertificate?.secure_url
    })

    //* 1=> create token 
    const payload = {
        email
    }
    const token = jwt.sign(payload, process.env.tokenKey)


    const link = `${req.protocol}://${req.headers.host}/api/v1/chef/confirm/${token}?ln=en`
    const object = `                                                    
    <td align="center" style="border-radius: 3px;" bgcolor="#ED9728"><a
      href="${link}" target="_blank"
      style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #ED9728; display: inline-block;">Confirm
      Account</a>
    </td>
  `
    let html = createHtml(object)
    await sendEmail(email, "Email confirmation", html)
    await chef.save()
    res.json({ message: allMessages[req.query.ln].CHECK_YOUY_INBOX });
}

export const confirmEmail = async (req, res, next) => {
    const token = req.params.token;
    const tokenDetails = jwt.verify(token, process.env.tokenKey)
    const user = await chefModel.findOneAndUpdate({ email: tokenDetails.email }, { confirmed: true }, { new: true }).select('-password')
    if (!user) {
        return res.status(404).json({ message: allMessages[req.query.ln].USER_NOT_EXIST });
    }
    res.json({ message: allMessages[req.query.ln].SUCCESS });
}

export const emailCheck = async (req, res, next) => {
    const { email } = req.body;
    const isExist = await chefModel.findOne({ email })
    if (isExist) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_VALID_ACCOUNT, 400))
    }
    res.status(201).json({ message: allMessages[req.query.ln].VALID_ACCOUNT })
}

export const changeOldPassword = async (req, res, next) => {
    const { oldPass, newPass } = req.body;
    const id = req.user.id
    let user = await chefModel.findById(id);
    const correctPass = bcrypt.compareSync(oldPass, user.password)
    if (!correctPass) {
        return next(new ErrorClass(allMessages[req.query.ln].FAIL_PASS, StatusCodes.BAD_REQUEST))
    }
    const samePass = bcrypt.compareSync(newPass, user.password)
    if (samePass) {
        return next(new ErrorClass(allMessages[req.query.ln].PASSWORD_SAME_AS_OLD_PASSWORD, StatusCodes.BAD_REQUEST))
    }
    const newPassHashed = bcrypt.hashSync(newPass, -process.env.salt)
    await chefModel.findByIdAndUpdate(id, { password: newPassHashed }, { new: true })
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
}

export const signIn = async (req, res, next) => {
    const { email, password } = req.body;
    const isExist = await chefModel.findOne({ email });
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
    const token = jwt.sign(payload, process.env.tokenKey)

    await chefModel.updateOne({ _id: isExist._id }, { isLoggedIn: true })
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS, token })
}

export const SendCode = async (req, res, next) => {
    const { email } = req.body;
    const user = await chefModel.findOne({ email })
    if (!user) {
        return next(new ErrorClass(allMessages[req.query.ln].USER_NOT_EXIST, StatusCodes.NOT_FOUND));

    }
    if (!user.confirmed) {
        return next(new ErrorClass(allMessages[req.query.ln].EMAIL_NOT_CONFIRMED, StatusCodes.FORBIDDEN));

    }
    const min = 100000;
    const max = 999999;
    const code = Math.floor(Math.random() * (max - min + 1)) + min;
    await chefModel.updateOne({ _id: user._id }, { code })
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

export const changePass = async (req, res) => {
    const { email, code, password } = req.body;
    const user = await chefModel.findOne({ email })
    if (!user) {
        return next(new ErrorClass(allMessages[req.query.ln].USER_NOT_EXIST, StatusCodes.NOT_FOUND));
    }
    if (user.code != code) {
        return next(new ErrorClass(allMessages[req.query.ln].INVALID_CODE, StatusCodes.FORBIDDEN));
    }
    const hashedPass = bcrypt.hashSync(password, 5);
    const min = 100000;
    const max = 999999;
    const newcode = Math.floor(Math.random() * (max - min + 1)) + min;

    await chefModel.findByIdAndUpdate(user._id, { password: hashedPass, code: newcode })
    return res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
}

export const updateChef = async (req, res, next) => {
    let { name, phone, location, brandName, minCharge, disc } = req.body
    const userId = req.user._id
    location = JSON.parse(location)
    const newLocation = {
        type: 'Point',
        coordinates: [location.coordinates[1], location.coordinates[0]]
    }
    const isBrandExist = await chefModel.findOne({
        brandName,
        _id: {
            $ne: userId
        }
    })
    console.log({ files: req.files.profilePic });
    if (isBrandExist) {
        return next(new ErrorClass(allMessages[req.query.ln].GENERAL_EXISTENCE));
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

    await chefModel.findByIdAndUpdate(
        userId,
        {
            name,
            phone,
            location: newLocation,
            brandName,
            minCharge,
            disc,
            profilePic: profilePic?.secure_url
        })
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })

}

export const deleteChef = async (req, res, next) => {
    const { id } = req.query

    if (req.user.role == roles.admin || req.user.role == roles.superAdmin || req.user._id == id) {
        const deleted = await chefModel.findByIdAndDelete(id);
        if (deleted) {
            // delete user meals
            await mealModel.deleteMany({ chefId: id })
            return res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
        } else {
            return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, StatusCodes.NOT_FOUND))
        }
    } else {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_AUTHORIZED))
    }
}

export const changeStatus = async (req, res, next) => {
    const userID = req.user._id;
    await chefModel.findByIdAndUpdate(userID, { online: !req.user.online })
    res.json({ message: allMessages[req.query.ln].SUCCESS, currentStatus: !req.user.online })
}

export const logout = async (req, res) => {
    const id = req.user._id;
    await chefModel.updateOne({ _id: id }, { isLoggedIn: false })
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
}

export const getChefData = async (req, res, next) => {
    const id = req.params.id;
    const user = req.user._id
    const chef = await chefModel.findById(id).select('-password -confirmed -code -role -isLoggedIn -updatedAt -__v').populate([{
        path: "menu",
        select: "-chefId -updatedAt -__v"
    }]);
    if (!chef) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, StatusCodes.NOT_FOUND))
    }

    res.status(StatusCodes.ACCEPTED).json({ chef })
}

/***
 * 



 location: {
            $geoWithin: { // في نطاق
                $centerSphere: [userLocation.coordinates, maxDistance / 6371000], // Convert meters to radians
            },
        },
        $expr: { $gt: [{ $size: "$menu" }, 0] },
        status: 'accepted'
 */
export const getChefMeals = async (req, res, next) => {
    const id = req.params.id
    const category = req.query.category
    let filter
    if (category) {
        filter = {
            status: 'accepted',
            category
        }
    } else {
        filter = {
            status: 'accepted',
        }
    }


    const chef = await chefModel.findOne({
        _id: id,
        status: 'accepted'
    })
    if (!chef) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, 404))
    }
    let meals = []
    let query = mealModel.find({ ...filter, chefId: id, status: 'accepted' }).populate([{
        path: 'category',
    }])
    const api = new ApiFeatures(query, req.query)
        .pagination()
        .search()
        .select()
        .sort()
        .filter()
    const menu = await api.mongooseQuery
    menu.map((ele) => {
        const index = meals.findIndex((meal) => {
            return meal.category.toString() == ele.category._id.toString()
        })
        if (index == -1) {
            meals.push({
                category: ele.category._id,
                categoryNameAR: ele.category.nameAR,
                categoryNameEN: ele.category.nameEN,
                categoryImage: ele.category.image,
                meals: [{
                    mealId: ele._id,
                    name: ele.name,
                    price: ele.price,
                    howToSell: ele.howToSell,
                    description: ele.description,
                    status: ele.status,
                    kind: ele.kind,
                    images: ele.images
                }]
            })
        } else {
            meals[index].meals.push({
                mealId: ele._id,
                name: ele.name,
                price: ele.price,
                howToSell: ele.howToSell,
                description: ele.description,
                status: ele.status,
                kind: ele.kind
            })
        }

    })

    res.json({ meals })
}