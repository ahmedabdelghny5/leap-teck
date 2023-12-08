import { Router } from 'express'
import validation from '../../middleware/validation.js'
import { asyncErrorHandler } from '../../utils/errorHandeling.js'
import noDateSchema from './../globalValidation.js';
import { auth, roles } from '../../middleware/auth.js'
import { myMulter } from '../../utils/multer.js'
import { dashboard } from './controllers/dashboard.js';
import * as adminDashboard from './controllers/admin.dash.js';
import { idOnly } from '../chef/chefValidation.js';


const router = Router()


router.route('/')
    .get(
        validation(noDateSchema),
        adminDashboard.dashboard
    )


router.route('/:id')
    .get(
        validation(idOnly),
        asyncErrorHandler(dashboard)
    )


export default router