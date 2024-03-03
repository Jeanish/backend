import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"


// if some paramter is not use, then write _
export const verifyJWT = asyncHandler(async(req,_,next)=>{ //_ is used 
    try {
        console.log(req.cookies)
        const token = await req.cookies?.refreshToken || req.header("authorization")?.replace("Bearer ", "")
        // console.log(token)

        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select(" -password -refreshToken")
    
        if(!user){
            // 
            throw new ApiError(401,"Invalid access Token")
    
        }
    
        // in user you can give any name here 
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || " invalid access token ")
    }

})