import { Router } from 'express';
import validation from '../../middleware/validation.js';
import noDateSchema from '../globalValidation.js';
import { asyncErrorHandler } from '../../utils/errorHandeling.js';
const router = Router({ mergeParams: true });

import * as meal from './controlers/mealControlers.js';
import * as Val from './mealValidation.js';
import { filesValidation, myMulter } from '../../utils/multer.js';
import { auth, roles } from '../../middleware/auth.js';



router.get('/',
     myMulter().array("", 0),
     // auth([roles.admin, roles.superAdmin, roles.chef, roles.user]),
     validation(Val.meal),
     asyncErrorHandler(meal.meal)
)

router.post('/add-to-menu',
     myMulter(filesValidation.image).array('mealImages'),
     validation(Val.addMealVal),
     auth([roles.chef],),
     meal.addMenu
)


router.patch('/update-meal/:id',
     myMulter(filesValidation.image).array('mealImages'),
     validation(Val.updateMealVal),
     auth([roles.chef],),
     asyncErrorHandler(meal.updateMeal)
)

router.delete('/delete-meal/:id',
     myMulter().array("", 0),
     validation(Val.idOnly),
     auth([roles.chef, roles.admin, roles.superAdmin],),
     asyncErrorHandler(meal.deleteMeal)
)

router.get('/get-meals',
     myMulter().array("", 0),
     validation(noDateSchema),
     asyncErrorHandler(auth([roles.user, roles.admin, roles.superAdmin, roles.chef])),
     asyncErrorHandler(meal.getAllMeals)
)



export default router