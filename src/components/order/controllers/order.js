import { config } from "dotenv";
import { StatusCodes } from "http-status-codes"
import ErrorClass from "../../../utils/ErrorClass.js"
import cartModel from "../../../../DB/models/cartModel.js";
import mealModel from './../../../../DB/models/mealModel.js';
import orderModel from "../../../../DB/models/ordersModel.js";
import Stripe from "stripe/cjs/stripe.cjs.node.js";
// import Stripe from "stripe";
import chefModel from "../../../../DB/models/chefModel.js";
import { ApiFeatures } from './../../../utils/apiFeatures.js';
import { allMessages } from "../../../utils/localizationHelper.js";

config()



const stripe = new Stripe(process.env.StripeKey);


export const mainOrder = async (req, res) => {
    res.json({ message: "This is order url" })
}

//* payment endPoints
export const createOrder = async (req, res, next) => {
    const user = req.user
    const cart = await cartModel.findOne({ userId: user._id }).populate([{
        path: "meals.meal",
    }])
    if (!cart.meals.length) {
        return next(new ErrorClass(allMessages[req.query.ln].EMPTY_CART))
    }
    let totalPrice = 0;
    let items = []
    const chefId = cart.meals[0].meal.chefId
    cart.meals = cart.meals.filter(meal => {
        if (meal.meal) {
            items.push({
                name: meal.meal.name,
                amount_cents: meal.meal.price * 100,
                description: meal.meal.description,
                quantity: meal.quantity
            })
            totalPrice += (meal.meal.price * meal.quantity)
            return { meal: meal.meal._id, quantity: meal.quantity }
        }
    })

    const { city, street, building, floor, apartment } = req.body
    const address = `${city}/${street}/${building}/${floor}/${apartment}`
    const order = new orderModel({ address, items: cart.meals, totalPrice, userId: user._id, chefId })
    console.log(order);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: user.email,
        metadata: {
            orderId: order._id.toString(),
        },
        success_url: `${req.protocol}://${req.headers.host}/api/v1/order/accepted`,
        cancel_url: `${req.protocol}://${req.headers.host}/api/v1/order/cancel`,
        line_items: items.map(ele => {
            return {
                price_data: {
                    currency: "EGP",
                    product_data: {
                        name: ele.name,
                        description: ele.description
                    },
                    unit_amount: ele.amount_cents
                },
                quantity: ele.quantity
            }
        })
    })
    ///////////note///////////
    order.note = req.body.note

    await order.save()
    res.status(StatusCodes.CREATED).json({ message: allMessages[req.query.ln].SUCCESS, paymentLink: session.url })
}


export const acceptPayment = async (req, res, next) => {

    res.json({ message: allMessages[req.query.ln].SUCCESS })
}


export const cancelPayment = async (req, res, next) => {

    res.json({ message: allMessages[req.query.ln].CANCELED })
}


export const webhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];

    let event = stripe.webhooks.constructEvent(req.body, sig, process.env.endpointSecret);

    if (event.type == "checkout.session.completed") {
        const orderId = event.data.object.metadata.orderId;
        const order = await orderModel.findByIdAndUpdate(orderId, {
            paid: true
        }, { new: true })

        await chefModel.updateOne({ _id: order.chefId }, { //* chef will take 90% from the total Price and app will take 10%
            $inc: {
                //* You can change the percentage 
                points: (order.totalPrice * 90 / 100)
            }
        })
        await cartModel.updateOne({ userId: order.userId }, { meals: [] })
        return res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS, order })
    } else {
        return next(new ErrorClass(allMessages[req.query.ln].PAYMENT_FAILED, StatusCodes.BAD_REQUEST))
    }
}


export const getChefOrders = async (req, res, next) => {
    const { orderStatus, drivenStatus } = req.query;
    const filter = {}
    if (orderStatus && orderStatus != 'all') {
        filter.orderStatus = orderStatus
    }
    if (drivenStatus && drivenStatus != 'all') {
        filter.drivenStatus = drivenStatus
    }
    const user = req.user._id;
    let query = orderModel.find({ chefId: user, ...filter }).populate([
        {
            path: 'userId',
            select: 'name phone email profilePic location'
        },
        {
            path: 'items.meal',
            select: 'name description images howToSell price category'
        }
    ]).select('-items._id -chefId')

    const api = new ApiFeatures(query, req.query)
        .filter()
        .pagination()
        .select()
        .sort()

    let orders = await api.mongooseQuery
    orders = orders.filter(order => {
        order.items = order.items.filter(item => {
            return item.meal != null
        })
        if (order.items.length > 0) {
            return order
        }
    })
    res.status(StatusCodes.ACCEPTED).json({ orders })
}


export const getUserOrders = async (req, res, next) => {
    const { orderStatus, drivenStatus } = req.query;
    const filter = {}
    if (orderStatus && orderStatus != 'all') {
        filter.orderStatus = orderStatus
    }
    if (drivenStatus && drivenStatus != 'all') {
        filter.drivenStatus = drivenStatus
    }
    const user = req.user._id;
    let query = orderModel.find({ userId: user, ...filter }).populate([
        {
            path: 'chefId',
            select: 'name phone email profilePic location'
        },
        {
            path: 'items.meal',
            select: 'name description images howToSell price category'
        }
    ]).select('-items._id -userId')

    const api = new ApiFeatures(query, req.query)
        .filter()
        .pagination()
        .select()
        .sort()
    let orders = await api.mongooseQuery
    orders = orders.map(order => {
        order.items = order.items.filter(item => {
            return item.meal != null
        })
        if (order.items.length > 0) {
            return order
        }
    })
    res.status(StatusCodes.ACCEPTED).json({ orders })
}

//* change order status

export const changeOrderStatus = async (req, res, next) => {
    const { orderStatus } = req.query;
    const orderId = req.params._id;
    const user = req.user._id;
    const order = await orderModel.findById(orderId)
    if (!order) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, 404))
    }
    if (order.chefId.toString() != user.toString()) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_AUTHORIZED, StatusCodes.UNAUTHORIZED))
    }
    await orderModel.updateOne({ _id: orderId }, { orderStatus })
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
}


export const changeDrivenStatus = async (req, res, next) => {
    const { drivenStatus } = req.query;
    const orderId = req.params._id;
    const user = req.user._id;
    const order = await orderModel.findById(orderId)
    if (!order) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, 404))
    }
    if (order.chefId.toString() != user.toString()) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_AUTHORIZED, StatusCodes.UNAUTHORIZED))
    }
    await orderModel.updateOne({ _id: orderId }, { drivenStatus })
    res.status(StatusCodes.ACCEPTED).json({ message: allMessages[req.query.ln].SUCCESS })
}