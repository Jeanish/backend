import {Router} from 'express'
import { loginUser, logoutUser, registerUser,refreshAccessToken } from '../controllers/user.controller.js'
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
router.route("/refresh-token").post(refreshAccessToken)

export default router
