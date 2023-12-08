import ErrorClass from '../../../utils/ErrorClass.js';
import {
    StatusCodes
} from 'http-status-codes';
import cloudinary from "../../../utils/cloudinary.js";
import { nanoid } from "nanoid";
import { roles } from "../../../middleware/auth.js";
import mealModel from "../../../../DB/models/mealModel.js";
import { paginate } from './../../../utils/pagination.js';

import chefModel from '../../../../DB/models/chefModel.js';
import categoryModel from './../../../../DB/models/categoryModel.js';
import { ApiFeatures } from './../../../utils/apiFeatures.js';
import { allMessages } from '../../../utils/localizationHelper.js';

export const meal = async (req, res, next) => {
    const filter = {}
    if (req.params.categoryId) {
        filter.category = req.params.categoryId
    }

    if (req.user?.role == roles.user) {
        filter.status = "accepted"
    }

    const meals = await mealModel.find(filter)
    res.json({ message: allMessages[req.query.ln].SUCCESS, meals })
}

export const addMenu = async (req, res, next) => {
    let { name, description, price, category, howToSell } = req.body;
    const chef = req.user;
    if (chef.status != "accepted") {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_ACCEPTED, StatusCodes.FORBIDDEN))
    }
    const isCategoryExist = await categoryModel.findById(category)
    if (!isCategoryExist) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, StatusCodes.NOT_FOUND))
    }
    const imagesDB = []
    if (req.files.length) {
        for (const image of req.files) {
            let img = await cloudinary.uploader.upload(image.path, {
                folder: `Meals/${image.originalname + nanoid()}`,
                public_id: image.originalname + nanoid(),
                use_filename: true,
                unique_filename: false,
                resource_type: "auto",

            })
            imagesDB.push(img.secure_url)
        }
    }
    const newMeal = new mealModel({
        name,
        description,
        price,
        images: imagesDB,
        category,
        howToSell,
        chefId: chef._id
    })
    let menu = chef.menu
    menu.push(newMeal._id)
    await chefModel.updateOne({ _id: chef._id }, { menu })
    await newMeal.save()
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS, newMeal })
}

export const updateMeal = async (req, res, next) => {
    let { name, description, price, category } = req.body;
    const mealId = req.params.id;
    const chef = req.user._id;

    const meal = await mealModel.findById(mealId);
    if (!meal) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, StatusCodes.NOT_FOUND))
    }
    if (meal.chefId.toString() != chef) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_AUTHORIZED, StatusCodes.FORBIDDEN))
    }


    const imagesDB = []
    if (req.files.length) {
        for (const image of req.files) {
            let img = await cloudinary.uploader.upload(image.path, {
                folder: `Meals/${image.originalname + nanoid()}`,
                public_id: image.originalname + nanoid(),
                use_filename: true,
                unique_filename: false,
                resource_type: "auto",

            })
            imagesDB.push(img.secure_url)
        }
    }
    await mealModel.updateOne({ _id: mealId }, {
        name,
        description,
        price,
        category,
        images: imagesDB
    })



    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
}

export const deleteMeal = async (req, res, next) => {
    const mealId = req.params.id;
    const chef = req.user;

    const meal = await mealModel.findById(mealId);
    if (!meal) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, StatusCodes.NOT_FOUND))
    }
    if (meal.chefId.toString() != chef._id && chef.role != roles.admin && chef.role != roles.superAdmin) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_AUTHORIZED, StatusCodes.FORBIDDEN))
    }
    const updateChefMenu = await chefModel.findById(meal.chefId)
    const mealIndex = updateChefMenu.menu.findIndex((meal) => meal.equals(mealId));
    const menu = updateChefMenu.menu.splice(mealIndex, 1);
    await chefModel.updateOne({ _id: chef._id }, { menu })


    await mealModel.deleteOne({ _id: mealId })
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
}

export const getAllMeals = async (req, res, next) => {
    const user = req.user;
    let userLatitude = user.location.coordinates[0]// خطوط الطول
    let userLongitude = user.location.coordinates[1] // خطوط العرض
    const userLocation = {
        type: 'Point',
        coordinates: [
            userLongitude,
            userLatitude
        ]
    }
    let maxDistance = 10; // max distance in km
    maxDistance = maxDistance * 1000

    const query = mealModel.find({
        status: 'accepted',
    }).populate([{
        path: 'chefId',
        select: 'name phone brandName',
        match: {
            location: {
                $geoWithin: {
                    $centerSphere: [userLocation.coordinates, maxDistance / 6371000], // Conv
                },
            },
            $expr: { $gt: [{ $size: "$menu" }, 0] },
            status: 'accepted'
        }
    }])


    const api = new ApiFeatures(query, req.query)
        .pagination()
        .search()
        .select()
        .sort()
        .filter()
    const meals = await api.mongooseQuery
    res.json({ message: allMessages[req.query.ln].SUCCESS, meals })
}