import { Router } from 'express'
import validation from '../../middleware/validation.js'
import { asyncErrorHandler } from '../../utils/errorHandeling.js'
import * as cart from './controllers/cart.js'
import * as Val from './cartValidation.js'
import noDateSchema from './../globalValidation.js';
import { auth, roles } from '../../middleware/auth.js'
import { myMulter } from '../../utils/multer.js'


const router = Router()


router.get('/',
    myMulter().array("", 0),
    validation(noDateSchema),
    asyncErrorHandler(cart.mainCart)
)

router.post('/add-to-cart',
    myMulter().array("", 0),
    validation(Val.addToCart),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(cart.addToCart)
)
router.get('/get-user-cart',
    myMulter().array("", 0),
    validation(noDateSchema),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(cart.getUserCart)
)

router.patch('/update-cart/:id',
    myMulter().array("", 0),
    validation(Val.updateCartVal),
    asyncErrorHandler(auth([roles.user])),
    cart.updateCart
)

router.delete('/delete-meal-from-cart/:mealId',
    myMulter().array("", 0),
    validation(Val.deleteMealFromCart),
    asyncErrorHandler(auth([roles.user])),
    asyncErrorHandler(cart.deleteMealFromCart)
)


export default router