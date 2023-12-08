import { StatusCodes } from "http-status-codes"
import ErrorClass from "../../../utils/ErrorClass.js"
import moment from 'moment';
import orderModel from './../../../../DB/models/ordersModel.js';
import mealModel from './../../../../DB/models/mealModel.js';
import chefModel from './../../../../DB/models/chefModel.js';
import userModel from './../../../../DB/models/userModel.js';
import { allMessages } from "../../../utils/localizationHelper.js";
moment().format();

export const dashboard = async (req, res, next) => {
    //* total chefs

    const chefs = await chefModel.find() // chefs
    const totalChefs = chefs.length     // number of chefs
    const todayChefNumber = await chefModel.count({
        createdAt: {
            $gte: moment().subtract(1, 'days').format()
        }
    }) // number of chefs which signed up today
    const chefIncreasePercentage = ((todayChefNumber / Math.abs(totalChefs - todayChefNumber)) * 100).toFixed(2) + "%"

    //* total users
    const users = await userModel.find() // users
    const totalUsers = users.length // number of users
    const todayUserNumber = await userModel.count({
        createdAt: {
            $gte: moment().subtract(1, 'days').format()
        }
    }) // number of users which signed up today
    const userIncreasePercentage = ((todayUserNumber / Math.abs(totalUsers - todayUserNumber)) * 100).toFixed(2) + "%"

    //* total orders
    const orders = await orderModel.find().populate('chefId items.meal') // orders

    const totalOrders = orders.length     // number of orders
    const todayOrderNumber = await orderModel.count({
        createdAt: {
            $gte: moment().subtract(1, 'days').format()
        }
    }) // number of Orders which signed up today
    const orderIncreasePercentage = (todayOrderNumber / Math.abs(totalOrders - todayOrderNumber) * 100).toFixed(2) + "%"

    //* 
    let lastRevenue = 0
    let todayRevenue = 0;



    // sort chefs by best seller
    const chefOrders = []
    let numberOfMeals = []

    orders.map(order => {
        if (order.chefId) {
            if (order.createdAt >= moment().subtract(1, 'days')) {
                todayRevenue += order.totalPrice
            } else {
                lastRevenue += order.totalPrice
            }

            const index = chefOrders.findIndex((ele) => {
                return ele.chefId.toString() === order.chefId?._id.toString()
            })
            if (index >= 0) {
                chefOrders[index].numberOfOrders += 1
            } else {
                chefOrders.push({
                    chefId: order.chefId._id,
                    name: order.chefId.name,
                    emil: order.chefId.email,
                    phone: order.chefId.phone,
                    profilePic: order.chefId.profilePic,
                    numberOfOrders: 1
                })
            }
            for (const item of order.items) {
                const index = numberOfMeals.findIndex((ele) => {
                    return ele.meal.toString() === item.meal._id.toString()
                })
                if (index >= 0) {
                    numberOfMeals[index].orders += 1;
                    numberOfMeals[index].allOrdersQuantity += item.quantity
                    numberOfMeals[index].amount += (item.quantity * item.meal.price)
                } else {
                    if (item.meal) {
                        numberOfMeals.push({
                            meal: item.meal._id,
                            orders: 1,
                            allOrdersQuantity: item.quantity,
                            images: item.meal.images,
                            name: item.meal.name,
                            createdAt: item.meal.createdAt,
                            price: item.meal.price,
                            amount: item.quantity * item.meal.price,
                            chef: order.chefId.name
                        })
                    }

                }
            }
        }


    })
    chefOrders.sort((b, a) => a.numberOfOrders - b.numberOfOrders);
    numberOfMeals.sort((b, a) => a.orders - b.orders);




    const totalRevenue = todayRevenue + lastRevenue
    const RevenueIncreasePercentage = (todayRevenue / Math.abs(totalRevenue - todayRevenue) * 100).toFixed(2) + "%"


    const chefCharts = getChart(chefs)
    const orderCharts = getChart(orders)
    const userCharts = getChart(users)
    const revenueCharts = getChart(orders, true)


    res.status(200).json({
        message: allMessages[req.query.ln].SUCCESS,
        bestSelling: numberOfMeals,
        revenueCharts,
        userCharts,
        orderCharts,
        chefCharts,
        chef: {
            totalChefs,
            todayOrderNumber,
            chefIncreasePercentage,
        },
        user: {
            totalUsers,
            todayUserNumber,
            userIncreasePercentage,

        },
        order: {
            totalOrders,
            todayOrderNumber,
            orderIncreasePercentage
        },
        revenue: {
            totalRevenue,
            todayRevenue,
            RevenueIncreasePercentage
        },
        bestSellers: chefOrders,

    })
}





const getChart = (data, revenue = false) => {
    const year = {
        Jan: 0,
        Feb: 0,
        Mar: 0,
        Apr: 0,
        May: 0,
        Jun: 0,
        Jul: 0,
        Aug: 0,
        Sep: 0,
        Oct: 0,
        Nov: 0,
        Dec: 0
    };
    const month = {
        week1: 0,
        week2: 0,
        week3: 0,
        week4: 0,
    }
    const week = {
        Sat: 0,
        Sun: 0,
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0
    };

    let monthDate = moment().subtract(1, 'month')
    let dataMonth = []
    let dataWeek = []

    for (const ele of data) {
        year[ele.createdAt.toString().split(' ')[1]] += revenue == true ? ele.totalPrice : 1;
        if (ele.createdAt > monthDate) {
            dataMonth.push(ele)
        }
    }

    for (const ele of dataMonth) {
        if (ele.createdAt > moment().subtract(1, 'week')) {
            month.week4 += revenue == true ? ele.totalPrice : 1
            dataWeek.push(ele)
        }
        else if (ele.createdAt > moment().subtract(2, 'week') && ele.createdAt < moment().subtract(1, 'week')) {
            month.week3 += revenue == true ? ele.totalPrice : 1
        }
        else if (ele.createdAt > moment().subtract(3, 'week') && ele.createdAt < moment().subtract(2, 'week')) {
            month.week2 += revenue == true ? ele.totalPrice : 1

        }
        else if (ele.createdAt > moment().subtract(4, 'week') && ele.createdAt < moment().subtract(3, 'week')) {
            month.week1 += revenue == true ? ele.totalPrice : 1
        }

    }
    for (const ele of dataWeek) {
        week[ele.createdAt.toString().split(' ')[0]] += revenue == true ? ele.totalPrice : 1;
    }


    return {
        year,
        month,
        week
    }
}

