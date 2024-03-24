import {Router} from 'express'
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.js'
import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from '../middleware/auth.middleware.js'

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },{
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)  //now localhost:3000/api/v1/users/register/

router.route("/login").post(loginUser)
// secured route
router.route("/logout").post(verifyJWT,  logoutUser)

export default router
