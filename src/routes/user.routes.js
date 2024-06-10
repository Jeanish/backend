import {Router} from 'express'
import { loginUser, logoutUser, registerUser,refreshAccessToken, updateUserAvatar, changeCurrentUserPassword, getCurrentUser, updateAccountDetails } from '../controllers/user.controller.js'
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
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentUserPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)


router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

export default router
