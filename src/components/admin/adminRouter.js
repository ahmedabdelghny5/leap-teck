import { Router } from 'express';
import validation from '../../middleware/validation.js';
import noDateSchema, { confirm } from '../globalValidation.js';
import { asyncErrorHandler } from '../../utils/errorHandeling.js';
const router = Router();

import * as admin from './controlers/adminControlers.js';
import * as Val from './adminValidation.js';
import { filesValidation, myMulter } from '../../utils/multer.js';
import { auth, roles } from '../../middleware/auth.js';




router.get('/', myMulter().array("", 0), validation(noDateSchema), asyncErrorHandler(admin.admin))
router.post('/add-admin',
     myMulter(filesValidation.image).fields([
          { name: "profilePic", maxCount: 1 }
     ]),
     validation(Val.signup),
     auth([roles.superAdmin]),
     asyncErrorHandler(admin.addAdmin)
)
router.get('/confirm/:token',
     myMulter().array("", 0),
     validation(confirm),
     asyncErrorHandler(admin.confirmEmail)
)
router.post('/check-email',
     myMulter().array("", 0),
     validation(Val.checkEmail),
     asyncErrorHandler(admin.emailCheck)
)
router.patch('/change-password',
     myMulter().array("", 0),
     auth([roles.admin, roles.superAdmin]),
     validation(Val.changePassSchema),
     asyncErrorHandler(admin.changeOldPassword)
)
router.post('/signin',
     myMulter().array("", 0),
     validation(Val.signIn),
     asyncErrorHandler(admin.signIn)
);
router.post('/send-code',
     myMulter().array("", 0),
     validation(Val.SendCode),
     asyncErrorHandler(admin.SendCode)
)
router.patch('/change-forgotten-password',
     myMulter().array("", 0),
     validation(Val.changeForgetPass),
     asyncErrorHandler(admin.changePass)
)

router.get('/get-chefs',
     myMulter().array("", 0),
     validation(Val.getChefs),
     auth([roles.admin,
     roles.superAdmin]),
     asyncErrorHandler(admin.getChefs)
)

router.post('/deal-with-chef-request/:id',
     myMulter().array("", 0),
     auth([roles.admin, roles.superAdmin]),
     validation(Val.dealWithChefRequest),
     asyncErrorHandler(admin.dealWithChefRequest)
)

router.get('/get-meals',
     myMulter().array("", 0),
     validation(Val.getChefs),
     auth([roles.admin, roles.superAdmin]),
     asyncErrorHandler(admin.getmeals)
)

router.post('/deal-with-meal-request/:id',
     myMulter().array("", 0),
     auth([roles.admin, roles.superAdmin]),
     validation(Val.dealWithChefRequest),
     asyncErrorHandler(admin.dealWithMealsRequest)

)
router.patch('/update',
     myMulter(filesValidation.image).fields([
          { name: 'profilePic', maxCount: 1 }
     ]),
     validation(Val.updateAdmin),
     auth([roles.admin, roles.superAdmin]),
     asyncErrorHandler(admin.updateAdmin)
)









router.delete('/delete/:id',
     myMulter().array("", 0),
     validation(Val.deleteAdmin),
     auth([roles.superAdmin]),
     asyncErrorHandler(admin.deleteAdmin)
)


router.get('/logout',
     myMulter().array("", 0),
     validation(noDateSchema),
     auth([roles.admin, roles.superAdmin]),
     asyncErrorHandler(admin.logout)
)


export default router

