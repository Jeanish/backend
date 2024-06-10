import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import getVideoDuration from "get-video-duration";
import { v2 as cloudinary } from 'cloudinary';
import { mongoose, isValidObjectId } from "mongoose"

const getAllVideos = asyncHandler(async(req,res)=>{
    
    const { page = 1, limit = 10, sortBy = "title", sortType = "ascending", userId } = req.query
    
    const limitNumber = parseInt(limit)
    const pageNumber = parseInt(page)

    


    return res
    .status(201)
    .json(new ApiResponse(200,getAllVideos,"All videos are showing"))
})

const updateVideo = asyncHandler(async(req,res)=>{
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"Videoid is not proper !")
    }

    const video = await Video.findById(videoId)
    const publicId = video.publicId;

    if(!publicId){
        throw new ApiError(401,"Video is not presnt !!")
    }
    if(publicId){
        try{    
            await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
        }catch(error){
            throw new ApiError(401,"Video is not deleted !!!")
        }
    }

    const newVideo = req.file?.path
    if(!newVideo){
        throw new ApiError(404,"Video file is required")
    }

    const videoOnCloudinary = await uploadOnCloudinary(newVideo);

    if(!videoOnCloudinary.url){
        throw new ApiError(401,"Error while uploading on cloudinary")
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                video: videoOnCloudinary.url,
                publicId: videoOnCloudinary.public_id,
                duration: videoOnCloudinary.duration
            }
        },
        {
            new: true
        }
    )
    
    return res.status(200).json(new ApiResponse(200,updateVideo,"Video updated Successfully !!"))

})
const publishVideo = asyncHandler(async(req,res) => {


    const { title,description } = req.body;
    // console.log(title + " title");
    
    if ([ title,description ].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields required");
    }

    const videoFile = req.files?.video[0]?.path;
    const thumbnailFile = req.files?.thumbnail[0]?.path;

    // console.log(videoFile);
    if(!videoFile || !thumbnailFile){
        throw new ApiError(404,"Video is required")
    }

    const videoOnCloudinary = await uploadOnCloudinary(videoFile);
    const thumbnailOnCloudinary = await uploadOnCloudinary(thumbnailFile);
    
    if(!videoOnCloudinary || !thumbnailFile){
        throw new ApiError(403,"Problem in uploading the video to cloudinary")
    }

    const video = await Video.create({
        video:videoFile.url,
        thumbnail:thumbnailFile.url,
        publicId: videoFile.public_id,
        title,
        description,
        duration:videoFile.duration,
        owner:req.user?._id,

    })

    const videoUploaded = await Video.findById(video?._id).select("-video -thumbnail -views -isPublished")

    if (!videoUploaded) {
        throw new ApiError(400, "Video is not Uploaded !")
    }

    return res.status(201).json(new ApiResponse(200,uploadVideo,"Video is uploaded properly"))

})

const deleteVideo = asyncHandler(async(req,res)=>{
    

    const videoId = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Videoid is not proper !")
    }

    const video = await Video.findById(videoId);

    const publicId = video.publicId;
    if(publicid){
        try{
            await cloudinary.uploader.destroy(publicId, { resource_type: 'video' })
        }catch (error) {
            throw new ApiError(400, "error while deleting video file from cloudinary")
        }
    
    }

    return res.status(200).json(new ApiResponse(200, [], "Video is deleted successfully !"))

})

 

export {
    getAllVideos,
    addView,
    publishVideo,
    deleteVideo,
    updateVideo

}
