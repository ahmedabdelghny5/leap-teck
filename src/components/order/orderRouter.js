import { Router } from 'express'
import validation from '../../middleware/validation.js'
import { asyncErrorHandler } from '../../utils/errorHandeling.js'
import * as order from './controllers/order.js'
import * as Val from './orderValidation.js'
import noDateSchema from './../globalValidation.js';
import { auth, roles } from '../../middleware/auth.js'
import { myMulter } from '../../utils/multer.js'
import express from 'express'

const router = Router()


router.get('/',
    myMulter().array("", 0),
    validation(noDateSchema),
    asyncErrorHandler(order.mainOrder)
)

router.post('/create-order',
    myMulter().array("", 0),
    auth([roles.user]),
    validation(Val.createOrder),
    order.createOrder
)

router.get('/accepted', asyncErrorHandler(order.acceptPayment))
router.get('/cancel', asyncErrorHandler(order.cancelPayment))
router.post('/webhook', express.raw({ type: 'application/json' }), asyncErrorHandler(order.webhook))

router.get('/chef-order',
    validation(Val.getOrders),
    asyncErrorHandler(auth([roles.chef, roles.admin, roles.superAdmin])),
    asyncErrorHandler(order.getChefOrders)
)

router.get('/user-order',
    validation(Val.getOrders),
    asyncErrorHandler(auth(roles.user, roles.admin, roles.superAdmin)),
    asyncErrorHandler(order.getUserOrders)
)
router.post('/change-order-status/:_id',
    validation(Val.changeOrderStatus),
    asyncErrorHandler(auth(roles.chef)),
    asyncErrorHandler(order.changeOrderStatus)
)
router.post('/change-driven-status/:_id',
    validation(Val.changeDrivenStatus),
    asyncErrorHandler(auth(roles.chef)),
    asyncErrorHandler(order.changeDrivenStatus)
)
export default router