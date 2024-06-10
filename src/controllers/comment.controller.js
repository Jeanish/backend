import { asyncHandler } from "../utils/asyncHandler";
import { video } from "../models/video.model";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse.js";
import comment from "../models/comments.models.js";

const getAllComment = asyncHandler(async(req,res)=>{
    const comment = await comment.find(req.comment);
    if(!comment){
        throw new ApiError(401,"Comment is not fetched")
    }

    return res.status(201).json()
})
