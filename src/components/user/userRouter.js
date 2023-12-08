import { Router } from 'express'
import { filesValidation, myMulter } from '../../utils/multer.js'
import validation from '../../middleware/validation.js'
import { asyncErrorHandler } from '../../utils/errorHandeling.js'
import * as user from './controllers/user.js'
import * as Val from './userValidation.js'
import noDateSchema, { confirm } from './../globalValidation.js';
import { auth, roles } from '../../middleware/auth.js'


const router = Router()


router.get('/',
    myMulter().array("", 0),
    validation(noDateSchema),
    asyncErrorHandler(user.mainUser)
)



router.post('/signup',
    myMulter(filesValidation.image).fields([
        { name: 'profilePic', maxCount: 1 }
    ]),
    validation(Val.signup),
    asyncErrorHandler(user.signup)
)

router.get('/confirm/:token',
    myMulter().array("", 0),
    validation(confirm),
    asyncErrorHandler(user.confirmEmail)
)

router.post('/check-email',
    myMulter().array("", 0),
    validation(Val.checkEmail),
    asyncErrorHandler(user.emailCheck)
)

router.post('/signin',
    myMulter().array("", 0),
    validation(Val.signIn),
    asyncErrorHandler(user.signIn)
)


router.patch('/change-password',
    myMulter().array("", 0),
    validation(Val.changePassSchema),
    auth([roles.user]),
    asyncErrorHandler(user.changeOldPassword)
)


router.post('/send-code',
    myMulter().array("", 0),
    validation(Val.SendCode),
    asyncErrorHandler(user.SendCode)
)

router.patch('/change-forgotten-password',
    myMulter().array("", 0),
    validation(Val.changeForgetPass),
    asyncErrorHandler(user.changePass)
)



router.patch('/update',
    myMulter(filesValidation.image).fields([
        { name: 'profilePic', maxCount: 1 }
    ]),
    validation(Val.updateUser),
    auth([roles.user]),
    asyncErrorHandler(user.updateUser)
)
router.delete('/delete',
    myMulter().array("", 0),
    validation(Val.deleteUser),
    auth([roles.user, roles.admin, roles.superAdmin]),
    asyncErrorHandler(user.deleteUser)
)


router.get('/get-user/:id',
    myMulter().array("", 0),
    validation(Val.idOnly),
    auth([roles.user, roles.admin, roles.superAdmin],),
    asyncErrorHandler(user.getUserData)
)





router.patch('/add-to-favorite/:mealId',
    myMulter().array("", 0),
    validation(Val.addToFavorite),
    auth([roles.user]),
    asyncErrorHandler(user.addToFavorite)
)





router.get('/get-favorite',
    myMulter().array("", 0),
    auth([roles.user]),
    validation(noDateSchema),
    user.getUserFavorites   
)



router.get('/logout',
    myMulter().array("", 0),
    validation(noDateSchema),
    auth([roles.user]),
    asyncErrorHandler(user.logout)
)


export default router