/*
    * *  بسم الله الرحمن الرحيم  * *
*/

import express from "express"
import cors from "cors";
import { errorHandel } from "./src/utils/errorHandeling.js";
import { DBConnection } from "./DB/config.js";
const app = express();
import { config } from 'dotenv';
import * as routes from "./src/router.js";
import userModel from "./DB/models/userModel.js";
import chefModel from "./DB/models/chefModel.js";
import cartModel from "./DB/models/cartModel.js";
import mealModel from "./DB/models/mealModel.js";
import adminModel from "./DB/models/adminModel.js";
import orderModel from "./DB/models/ordersModel.js";
import moment from "moment";
import ErrorClass from "./src/utils/ErrorClass.js";
import { allMessages } from "./src/utils/localizationHelper.js";
// import { initIo } from "./src/utils/socket.io.js";
config()
app.use((req, res, next) => {
    if (req.originalUrl == "/api/v1/order/webhook") {
        next();
    } else {
        express.json()(req, res, next)
    }
})
app.use(cors())
const port = process.env.port || 5000;
DBConnection()


app.get('/', (req, res) => {
    res.json({ message: "Welcome to leap teck server" })
})


// app.get('/delete-every-thing',async (req, res, next) => {
//     // await userModel.deleteMany()
//     // await chefModel.deleteMany()
//     // await cartModel.deleteMany()
//     // await mealModel.deleteMany()
//     // await adminModel.deleteMany()
//     // await orderModel.deleteMany()
//     await chefModel.updateMany({},{
//         rate:0,
//         numberOfRates:0
//     })
//     res.json({message:"ليه بس كده يا عم ضيف تانى بقا داتا"})
// })
console.log(moment().subtract(1, 'days').format());

app.use(`${process.env.baseurl}/chef`, routes.chefRouter)
app.use(`${process.env.baseurl}/admin`, routes.adminRouter)
app.use(`${process.env.baseurl}/user`, routes.userRouter)
app.use(`${process.env.baseurl}/cart`, routes.cartRouter)
app.use(`${process.env.baseurl}/meal`, routes.mealRouter)
app.use(`${process.env.baseurl}/category`, routes.categoryRouter)
app.use(`${process.env.baseurl}/order`, routes.orderRouter)
app.use(`${process.env.baseurl}/review`, routes.reviewRouter)
app.use(`${process.env.baseurl}/dashboard`, routes.dashboardRouter)
app.use(`${process.env.baseurl}/chat`, routes.chatRouter)


app.all('*', (req, res, next) => {
    return next(new ErrorClass(allMessages.en.IN_VALID_URL))
});






app.use(errorHandel)


const server = app.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
})


// const io = initIo(server)

// io.on('connection', (socket) => {
//     console.log({ socketId: socket.id });
// })
