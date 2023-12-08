import { Router } from 'express';
import validation from '../../middleware/validation.js';
import noDateSchema, { confirm } from '../globalValidation.js';
import { asyncErrorHandler } from '../../utils/errorHandeling.js';
const router = Router();

import * as chef from './controlers/chefControlers.js';
import * as Val from './chefValidation.js';
import { filesValidation, myMulter } from '../../utils/multer.js';
import { auth, roles } from '../../middleware/auth.js';
import mealRouter from '../meal/mealRouter.js';

router.use('/get-chef/:chefId/meals', mealRouter)


router.get('/', myMulter().array("", 0), validation(noDateSchema), asyncErrorHandler(chef.chef))

router.post('/signup',
     myMulter(filesValidation.image).fields([
          { name: "healthCertificate", maxCount: 1 },
          { name: 'frontId', maxCount: 1 },
          { name: 'profilePic', maxCount: 1 },
          { name: 'backId', maxCount: 1 }
     ]),
     validation(Val.signup),
     asyncErrorHandler(chef.signup)
)

router.get('/confirm/:token', myMulter().array("", 0),validation(confirm), asyncErrorHandler(chef.confirmEmail))

router.post('/check-email', myMulter().array("", 0), validation(Val.checkEmail), asyncErrorHandler(chef.emailCheck))

!router.patch('/change-password', myMulter().array("", 0), auth([roles.chef]), validation(Val.changePassSchema), asyncErrorHandler(chef.changeOldPassword))

router.post('/signin', myMulter().array("", 0), validation(Val.signIn), asyncErrorHandler(chef.signIn));

router.post('/send-code', myMulter().array("", 0), validation(Val.SendCode), asyncErrorHandler(chef.SendCode))

router.patch('/change-forgotten-password', myMulter().array("", 0), validation(Val.changeForgetPass), asyncErrorHandler(chef.changePass))

router.patch('/update',
     myMulter(filesValidation.image).fields([
          { name: 'profilePic', maxCount: 1 }
     ]),
     validation(Val.updateChef),
     asyncErrorHandler(auth([roles.chef])),
     asyncErrorHandler(chef.updateChef)
)
router.delete('/delete',
     myMulter().array("", 0),
     validation(Val.deleteChef),
     auth([roles.chef, roles.admin, roles.superAdmin]),
     asyncErrorHandler(chef.deleteChef)
)

router.patch('/change-chef-status',
     myMulter().array("", 0),
     validation(Val.changeStatus),
     auth([roles.chef]),
     asyncErrorHandler(chef.changeStatus)
)


router.get('/get-chef/:id',
     myMulter().array("", 0),
     validation(Val.idOnly),
     auth([roles.admin, roles.superAdmin, roles.chef, roles.user]),
     asyncErrorHandler(chef.getChefData)
)




router.get('/logout',
     myMulter().array("", 0),
     validation(noDateSchema),
     auth([roles.chef]),
     asyncErrorHandler(chef.logout)
)

router.get('/get-chef-meals-category/:id',
     myMulter().array("", 0),
     validation(Val.idOnly),
     asyncErrorHandler(chef.getChefMeals)
)




export default router