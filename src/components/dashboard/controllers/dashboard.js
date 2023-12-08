import { StatusCodes } from "http-status-codes"
import ErrorClass from "../../../utils/ErrorClass.js"
import moment from 'moment';
import orderModel from './../../../../DB/models/ordersModel.js';
import mealModel from './../../../../DB/models/mealModel.js';
import { allMessages } from "../../../utils/localizationHelper.js";
moment().format();

export const dashboard = async (req, res, next) => {

    const chefId = req.params.id
    const numberOfMeals = []

    const orders = await orderModel.find({
        chefId,
        createdAt: { $gte: moment().subtract(1, 'days').format() }
    }).populate([{
        path: 'items.meal',
    }])
    const customers = [], dishes = []
    let earnings = 0
    let sourcesOfProfits = {
        drinks: 0,
        foods: 0,
        dessert: 0
    }
    let statuses = {
        arrived: 0,
        cooking: 0,
        waiting: 0,
        orders: 0
    }
    const week = {
        Sat: {
            foods: 0,
            drinks: 0,
            dessert: 0,
        },
        Sun: {
            foods: 0,
            drinks: 0,
            dessert: 0,
        },
        Mon: {
            foods: 0,
            drinks: 0,
            dessert: 0,
        },
        Tue: {
            foods: 0,
            drinks: 0,
            dessert: 0,
        },
        Wed: {
            foods: 0,
            drinks: 0,
            dessert: 0,
        },
        Thu: {
            foods: 0,
            drinks: 0,
            dessert: 0,
        },
        Fri: {
            foods: 0,
            drinks: 0,
            dessert: 0,
        }
    };

    for (const order of orders) {
        let data = week[order.createdAt.toString().split(' ')[0]];
        for (const item of order.items) {
            if (!item.meal) {
            } else {
                data[item.meal.kind] += (item.meal.price * item.quantity)
            }
        }
        statuses[order.drivenStatus] = statuses[order.drivenStatus] + 1
    }

    for (const order of orders) {
        if (!customers.includes(order.userId.toString())) {
            customers.push(order.userId.toString())
        }
        for (const item of order.items) {
            if (item.meal) {
                if (!dishes.includes(item.meal._id.toString())) {
                    dishes.push(item.meal._id.toString())
                }
                sourcesOfProfits[item.meal.kind] += (item.meal.price * item.quantity)
                const index = numberOfMeals.findIndex((ele) => {
                    return ele.meal.toString() === item.meal._id.toString()
                })
                if (index >= 0) {
                    numberOfMeals[index].quantity += item.quantity
                } else {
                    numberOfMeals.push({
                        meal: item.meal._id,
                        quantity: item.quantity,
                        images: item.meal.images,
                        name: item.meal.name
                    })
                }
            }

        }
        earnings = earnings + order.totalPrice

    }
    numberOfMeals.sort((b, a) => a.quantity - b.quantity);
    statuses.orders = orders.length
    console.log((sourcesOfProfits.foods / earnings * 100) || 0);
    res.json({
        message: allMessages[req.query.ln].SUCCESS,
        orders: orders.length,
        week,
        statuses,
        customers: customers.length,
        dishes: dishes.length,
        earnings,
        sourcesOfProfits,
        foodPercentage: (sourcesOfProfits.foods / earnings * 100) || 0,
        drinksPercentage: (sourcesOfProfits.drinks / earnings * 100) || 0,
        dessertPercentage: (sourcesOfProfits.dessert / earnings * 100) || 0,
        bestSeller: numberOfMeals[0] ? numberOfMeals[0] : null,
    });
}



