import { Router } from 'express';
import validation from '../../middleware/validation.js';
import noDateSchema from '../globalValidation.js';
import { asyncErrorHandler } from '../../utils/errorHandeling.js';
const router = Router();

import * as MC from './controlers/categoryControlers.js';
import * as Val from './categoryValidation.js';
import { myMulter } from '../../utils/multer.js';
import { auth, roles } from '../../middleware/auth.js';
import mealRouter from '../meal/mealRouter.js'
import { idOnly } from '../meal/mealValidation.js';
router.use('/:categoryId/meals', mealRouter)

router.route('/')
     .get(
          myMulter().array("", 0),
          validation(Val.getCategories),
          asyncErrorHandler(MC.getCategories)
     )
     .post(
          myMulter().single("image"),
          validation(Val.createCategory),
          auth([roles.admin, roles.superAdmin]),
          asyncErrorHandler(MC.createCategory)
     )



router.route('/:id')
     .get(
          myMulter().array("", 0),
          validation(idOnly),
          asyncErrorHandler(MC.getCategories)
     )
     .delete(
          myMulter().array("", 0),
          validation(idOnly),
          auth([roles.admin, roles.superAdmin]),
          asyncErrorHandler(MC.deleteCategory)
     )
     .put(
          myMulter().single("image"),
          validation(Val.updateCategory),
          auth([roles.admin, roles.superAdmin]),
          asyncErrorHandler(MC.updateCategory)
     )



export default router