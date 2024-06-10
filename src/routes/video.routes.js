import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from '../middleware/auth.middleware.js'
import { Router } from "express"
import { addView, getAllVideos, publishVideo } from "../controllers/video.controller.js"

const router = Router()
// router.use(verifyJWT)

router.route("/").post(
    upload.fields([
        {
            name:"video",
            maxCount:1
        },{
            name:"thumbnail",
            maxCount:1
        }
    ]),
    publishVideo)

// router.route("/").post(verifyJWT,publishVideo)
router.route("/:id").put(verifyJWT,publishVideo)
router.route("/:id").delete(verifyJWT,publishVideo)
router.route("/find/:id").get(publishVideo)
router.route("/:id").get(addView)
// router.route("/:id").()


export default router