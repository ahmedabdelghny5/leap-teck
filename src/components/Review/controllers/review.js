import { StatusCodes } from "http-status-codes"
import ErrorClass from "../../../utils/ErrorClass.js"
import mealModel from "../../../../DB/models/mealModel.js";
import reviewModel from "../../../../DB/models/reviewModel.js";
import orderModel from "../../../../DB/models/ordersModel.js";
import chefModel from "../../../../DB/models/chefModel.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
import { allMessages } from "../../../utils/localizationHelper.js";


export const addReview = async (req, res, next) => {
    const user = req.user._id;
    const { comment, rate, mealId } = req.body
    const meal = await mealModel.findById(mealId)
    if (!meal) {
        return next(new ErrorClass('meal not found', 404));
    }
    if (!mealId) {
        return next(new ErrorClass(allMessages[req.query.ln].MEAL_ID_REQUIRED, StatusCodes.BAD_REQUEST));
    }
    if (req.body.chefId) {
        return next(new ErrorClass(allMessages[req.query.ln].CHEF_ID_NOT_ALLOWED, StatusCodes.BAD_REQUEST));
    }
    const isReviewed = await reviewModel.findOne({ user, meal: meal._id })
    if (isReviewed) {
        return next(new ErrorClass(allMessages[req.query.ln].REVIEW_AGAIN))
    }
    const order = await orderModel.findOne({
        userId: user,
        'items.meal': meal._id,
        drivenStatus: "arrived"
    })
    if (order) {
        return next(new ErrorClass(allMessages[req.query.ln].REVIEW_WITH_OUT_TRY))
    }
    meal.rate = ((meal.rate * meal.numberOfRates) + rate) / (++meal.numberOfRates)

    const review = await reviewModel.create({ comment, rate, meal: meal._id, user })
    await meal.save()
    return res.status(202).json({ message: allMessages[req.query.ln].SUCCESS, review })
}


export const updateReview = async (req, res, next) => {
    const reviewId = req.params.id;
    const { comment, rate } = req.body;
    const user = req.user._id;
    const review = await reviewModel.findById(reviewId);
    if (!review || !review.meal) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND))
    }
    if (review.user.toString() != user.toString()) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_AUTHORIZED))
    }

    if (rate) {
        const product = await mealModel.findById(review.meal)
        product.rate = ((product.rate * product.numberOfRates - review.rate) + rate) / product.numberOfRates
        review.rate = rate
        await product.save()
    }
    if (comment) {
        review.comment = comment
    }
    await review.save();


    res.status(200).json({ message: allMessages[req.query.ln].SUCCESS, review })
}

export const deleteMealReview = async (req, res, next) => {
    const reviewId = req.params.id;
    const user = req.user._id;
    const review = await reviewModel.findById(reviewId);
    if (!review || !review.meal) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND));
    }
    if (review.user.toString() != user.toString()) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_AUTHORIZED, StatusCodes.UNAUTHORIZED))
    }

    const meal = await mealModel.findById(review.meal)
    meal.rate = (meal.rate * meal.numberOfRates - review.rate) / --meal.numberOfRates
    await meal.save()

    await review.deleteOne()
    res.status(200).json({ message: allMessages[req.query.ln].SUCCESS, review })
}


export const reviewChef = async (req, res, next) => {
    const user = req.user._id;
    const { comment, rate, chefId } = req.body
    if (!chefId) {
        return next(new ErrorClass(allMessages[req.query.ln].CHEF_ID_REQUIRED, StatusCodes.BAD_REQUEST));
    }
    if (req.body.mealId) {
        return next(new ErrorClass(allMessages[req.query.ln].MEAL_ID_NOT_ALLOWED, StatusCodes.BAD_REQUEST));
    }
    const chef = await chefModel.findById(chefId)
    if (!chef) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, 404));
    }

    const isReviewed = await reviewModel.findOne({ user, chef: chef._id })
    if (isReviewed) {
        return next(new ErrorClass(allMessages[req.query.ln].REVIEW_AGAIN))
    }
    const order = await orderModel.findOne({
        userId: user,
        chefId: chef._id,
        drivenStatus: "arrived"
    })
    if (order) {
        return next(new ErrorClass(allMessages[req.query.ln].REVIEW_WITH_OUT_TRY))
    }
    let newRate = ((chef.rate * chef.numberOfRates) + rate) / (++chef.numberOfRates)

    await chefModel.updateOne({ _id: chefId }, {
        rate: newRate,
        $inc: {
            numberOfRates: 1
        }
    })
    const review = await reviewModel.create({ comment, rate, chef: chef._id, user })
    return res.status(202).json({ message: allMessages[req.query.ln].SUCCESS, review })
}


export const updateChefReview = async (req, res, next) => {
    const reviewId = req.params.id;
    const { comment, rate } = req.body;
    const user = req.user._id;

    const review = await reviewModel.findById(reviewId);
    if (!review || !review.chef) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND))
    }
    if (review.user.toString() != user.toString()) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_AUTHORIZED))
    }

    if (rate) {
        const chef = await chefModel.findById(review.chef)
        let newRate = ((chef.rate * chef.numberOfRates - review.rate) + rate) / chef.numberOfRates
        await chefModel.updateOne({ _id: chef._id }, { rate: newRate })
        review.rate = rate
    }
    if (comment) {
        review.comment = comment
    }
    await review.save();
    res.status(200).json({ message: allMessages[req.query.ln].SUCCESS, review })
}


export const deleteChefReview = async (req, res, next) => {
    const reviewId = req.params.id;
    const user = req.user._id;
    const review = await reviewModel.findById(reviewId);
    if (!review || !review.chef) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND))
    }
    if (review.user.toString() != user.toString()) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_ACCEPTED))
    }

    const chef = await chefModel.findById(review.chef)
    let newRate = chef.numberOfRates - 1 == 0 ? 0 : ((chef.rate * chef.numberOfRates - review.rate)) / (--chef.numberOfRates)
    await chefModel.updateOne({ _id: chef._id }, {
        rate: newRate, $inc: {
            numberOfRates: -1
        }
    })
    await review.deleteOne();
    res.status(200).json({ message: allMessages[req.query.ln].SUCCESS, review })
}

export const getReviews = async (req, res, next) => {
    const userId = req.params.id;
    let filter = {

    }
    if (req.originalUrl.includes('chef')) {
        filter.chef = userId
    } else if (req.originalUrl.includes('meal')) {
        filter.meal = userId
    }
    const query = reviewModel.find(filter)
    const api = new ApiFeatures(query, req.query)
        .filter()
        .pagination()
        .select()
        .sort()

    const reviews = await api.mongooseQuery
    res.json({ message: allMessages[req.query.ln].SUCCESS, reviews })
}