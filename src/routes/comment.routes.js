import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from '../middleware/auth.middleware.js'
import { Router } from "express"

const router = Router()

export default router