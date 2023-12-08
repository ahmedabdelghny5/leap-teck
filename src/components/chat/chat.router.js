import { Router } from 'express'
import validation from '../../middleware/validation.js'
import { asyncErrorHandler } from '../../utils/errorHandeling.js'
import { auth, roles } from '../../middleware/auth.js'
import * as chatController from './controller/chat.js'

const router = Router()


router.get('/:id',
    auth(Object.values(roles)),
    asyncErrorHandler(chatController.getChat)
)

router.post('/',
    auth(Object.values(roles)),
    asyncErrorHandler(chatController.getChat)
)


export default router