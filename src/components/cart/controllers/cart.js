import { StatusCodes } from "http-status-codes"
import ErrorClass from "../../../utils/ErrorClass.js"
import cartModel from "../../../../DB/models/cartModel.js";
import mealModel from './../../../../DB/models/mealModel.js';
import { allMessages } from "../../../utils/localizationHelper.js";

export const mainCart = async (req, res) => {
    res.json({ message: "This is cart url" })
}

export const addToCart = async (req, res, next) => {
    const { mealDetails } = req.body
    const userId = req.user._id
    const meal = await mealModel.findById(mealDetails.meal)
    if (!meal) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, StatusCodes.NOT_FOUND))
    }
    if (meal.howToSell == 'number') {
        if (!Number.isInteger(mealDetails.quantity)) {
            return next(new ErrorClass(allMessages[req.query.ln].NOT_WEIGHT, StatusCodes.BAD_REQUEST))
        }
    }
    const newCart = await cartModel.findOne({ userId })
    const mealExist = newCart.meals.findIndex((ele) => {
        return ele.meal == mealDetails.meal
    })
    if (mealExist == -1) {
        if (newCart.chefId?.toString() != meal.chefId.toString()) {
            newCart.meals = []
            newCart.chefId = meal.chefId
        }
        newCart.meals.push(mealDetails)
        if (!newCart.chefId) {
            newCart.chefId = meal.chefId
        }
        await newCart.save()
        return res.status(StatusCodes.CREATED).json({ message: allMessages[req.query.ln].SUCCESS, result: newCart })

    } else {
        newCart.meals[mealExist].quantity = newCart.meals[mealExist].quantity + mealDetails.quantity
    }
    await newCart.save();
    let cart = await cartModel.findOne({ userId }).populate([{
        path: 'meals.meal',
        select: 'name price howToSell images category ingredients',
    }, {
        path: 'chefId',
        select: 'brandName name phone email profilePic',
    }])
    cart.meals = cart.meals.filter(meal => {
        return meal.meal != null
    })
    await cart.save()
    let totalCost = 0;
    for (const meal of cart.meals) {
        totalCost += Number(meal.meal.price) * Number(meal.quantity)
    }
    res.status(StatusCodes.CREATED).json({ message: allMessages[req.query.ln].SUCCESS, result: cart, totalCost })
}

export const getUserCart = async (req, res, next) => {
    const userId = req.user._id

    let cart = await cartModel.findOne({ userId }).populate([{
        path: 'meals.meal',
        select: 'name price howToSell images category ingredients',
    }, {
        path: 'chefId',
        select: 'brandName name phone email profilePic',
    }])
    cart.meals = cart.meals.filter(meal => {
        return meal.meal != null
    })
    await cart.save()
    let totalCost = 0;
    for (const meal of cart.meals) {
        totalCost += Number(meal.meal.price) * Number(meal.quantity)
    }
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS, result: cart, totalCost })
}

export const updateCart = async (req, res, next) => {
    const mealId = req.params.id
    const userId = req.user._id
    const { quantity } = req.body;
    const cart = await cartModel.findOne({ userId, 'meals.meal': mealId }).populate([{
        path: 'meals.meal',
        select: 'name price howToSell images category ingredients',
    }, {
        path: 'chefId',
        select: 'brandName name phone email profilePic',
    }])
    const meal = cart.meals.findIndex(ele => {
        return ele.meal._id == mealId
    });
    if (meal < 0) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, StatusCodes.NOT_FOUND));
    }
    if (cart.meals[meal].meal.howToSell == 'number') {
        if (!Number.isInteger(quantity)) {
            return next(new ErrorClass(allMessages[req.query.ln].NOT_WEIGHT, StatusCodes.BAD_REQUEST))
        }
    }
    cart.meals[meal].quantity = quantity
    cart.meals = cart.meals.filter(meal => {
        return meal.meal != null
    })
    await cart.save()
    let totalCost = 0

    for (const meal of cart.meals) {
        totalCost += Number(meal.meal.price) * Number(meal.quantity)
    }
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS, result: cart, totalCost })
}

export const deleteMealFromCart = async (req, res, next) => {
    const userId = req.user._id
    const mealId = req.params.mealId
    const cart = await cartModel.findOne({ userId }).populate('meals.meal');

    // find the index of the meal subdocument in the meals array
    const mealIndex = cart.meals.findIndex((meal) => meal.meal.equals(mealId));
    if (mealIndex === -1) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, 404));
    }
    cart.meals.splice(mealIndex, 1);
    await cart.save();
    let totalCost = 0

    for (const meal of cart.meals) {
        totalCost += Number(meal.meal.price) * Number(meal.quantity)
    }
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS, result: cart, totalCost })
}