import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";

//Generate access and refresh token
const generateAccessAndRefreshTokens = async(userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false });

    return {accessToken, refreshToken}
  } 
  catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    )
  }
}

//registration page
const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  /// validtaion -- not empty
  //check user is already exits : username , email
  // check f0r images,check for avtar
  //upload them to cloudinary avtar
  //create user object-create entry in db
  //remove pwd and refresh token field from response
  //check response of user creation return res nhi huwa toh error

  const { fullname, email, username, password } = req.body;
  // console.log("email",email);
  // console.log("username",userName);
  // console.log("password",password);

  // if (fullname === ""){
  //     throw new ApiError(400,"full name required")
  // }
  if (
    [fullname, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  })
  // console.log(existedUser)

  if (existedUser) {
    throw new ApiError(409, "User with email or username is already existed");
  }
  // multer give access of req.files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // console.log(avatarLocalPath)

  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
    coverImageLocalPath = req.files.coverImage[0].path
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // console.log(avatar)

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" //string pass ho aata hai or by default sab select hota hai, so ismai hume deselect karna hoga.
  )
  //    console.log(createdUser)

  //check response of user creation and error handling
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  //return res
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"))
})

// login system
const loginUser = asyncHandler(async (req, res) => {
  // req.body->data
  // username or email
  // find user
  // password check
  // access and refresh token
  // send this token in the form of cookie and with secure cookie

  const {email,username,password} = req.body

  if (!username && !email) {
    throw new ApiError(400, "username or password is required");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] })

  if (!user) {
    throw new ApiError(401, "user is not registered");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
  // console.log(refreshToken)

  // databse se query karni padegi if expensive hai object mai karo nahi toh maar do
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  // in frontend it will not update
  const options = {
    httpOnly: true,
    secure: true,
  }
  // console.log(user.refreshToken);

  return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    )
})

//-------FOR LOGOUT------
// REMOVE THE ACCESSTOKEN AND REFRESHTOKEN
// remove the cookie

const logoutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
      req.user._id,
      {
          $unset: {
              refreshToken: 1 // this removes the field from document
          }
      },
      {
          new: true
      }
  )

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(incomingRefreshToken){
    throw new ApiError(401,"Unauthorized request")
  }
  
  try {
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
    const user = await User.findById(decodedToken?._id)
    
    if(!user){
      throw new ApiError(401,"Invalid refresh Token")
    }
  
    if(!incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh token is expired or used")
    }
  
    const options = {
      httpOnly:true,
      secure:true,
    }
  
    const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
  
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newRefreshToken,options).json(new ApiResponse(
      200,{accessToken,newRefreshToken},
      "Access token refreshed"
    ))
  } catch (error) {
    throw new ApiError(401,error?.message||"Invalid refresh token")
  }

})

const changeCurrentUserPassword = asyncHandler(async (req,res)=>{

  const {oldPassword,newPassword} = req.body

  // if(!(newPassword === confirmPassword)){
  //   throw new ApiError(402,"Password is not matched")
  // }
  const user = await User.findById(req.iser?._id)
  const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword)

 if(!isPasswordCorrect){
  throw new ApiError(401,"Invalid old password")

 }
 user.password = newPassword
 await user.save({validateBeforeSave:false})

 return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))

})

const getCurrentUser = asyncHandler(async(req,res)=>{
  return res.status(200).json(200,req.user,"current user fetched sccessfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullname,email}=req.body
  if(!fullname || !email){
    throw new ApiError(400,"All fields are required")
  }

  const user = await User.findByIdAndUpdate(req.user?._id,{
    $set:{
      fullname,
      email
    }
  },{
    new:true
  }
  ).select("-password")

  return res.status(200).json(new ApiResponse(200,user,"Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath=req.file?.path

  if(!avatarLocalPath){
    throw new ApiError(400,"avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url)
  {
  throw new ApiError(400,"error file avatar")
  }

  const user = await User.findByIdAndUpdate(req.user?._id,{
    $set:{
      avatar:avatar.url
    }
  },{new:true}).select("-password")
  return res.status(200).json(new ApiResponse(200,user,"Update of avatar successfully"))

})

export { registerUser, 
  loginUser, 
  logoutUser,
  refreshAccessToken ,
  getCurrentUser,
  changeCurrentUserPassword,
  updateAccountDetails,
  updateUserAvatar

}
