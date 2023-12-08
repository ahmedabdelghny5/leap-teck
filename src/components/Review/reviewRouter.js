import { Router } from 'express'
import validation from '../../middleware/validation.js'
import { asyncErrorHandler } from '../../utils/errorHandeling.js'
import { auth, roles } from '../../middleware/auth.js'
import { myMulter } from '../../utils/multer.js';
import * as RCV from './reviewValidation.js';
import * as RC from './controllers/review.js';
import { idOnly } from '../chef/chefValidation.js';
import noDateSchema from '../globalValidation.js';


const router = Router()

router.route('/meal')
    .get(
        (_, res) => {
            res.json({ message: "Review Router" })
        }
    )
    .post(
        myMulter().array("", 0),
        validation(RCV.createReviewVal),
        asyncErrorHandler(auth([roles.user])),
        asyncErrorHandler(RC.addReview)
    )


router.route('/meal/:id')
    .put(
        myMulter().array("", 0),
        validation(RCV.updateReviewVal),
        asyncErrorHandler(auth([roles.user])),
        asyncErrorHandler(RC.updateReview)
    )
    .delete(
        myMulter().array("", 0),
        validation(idOnly),
        asyncErrorHandler(auth([roles.user])),
        asyncErrorHandler(RC.deleteMealReview)
    )
    .get(
        validation(noDateSchema),
        asyncErrorHandler(RC.getReviews)
    )




router.route('/chef')
    .get(
        (_, res) => {
            res.json({ message: "Review Router" })
        }
    )
    .post(
        myMulter().array("", 0),
        validation(RCV.createReviewVal),
        asyncErrorHandler(auth([roles.user])),
        asyncErrorHandler(RC.reviewChef)
    )


router.route('/chef/:id')
    .put(
        myMulter().array("", 0),
        validation(RCV.updateReviewVal),
        asyncErrorHandler(auth([roles.user])),
        asyncErrorHandler(RC.updateChefReview)

    )
    .delete(
        myMulter().array("", 0),
        validation(idOnly),
        asyncErrorHandler(auth([roles.user])),
        asyncErrorHandler(RC.deleteChefReview)
    )
    .get(
        validation(noDateSchema),
        asyncErrorHandler(RC.getReviews)
    )

export default router