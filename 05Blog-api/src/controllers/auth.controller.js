import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import {
  loginUserService,
  registerUserService,
} from "../services/auth.service.js";

const registerUser = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const avatarPath = req.file?.path; // localFilePath from public/temp

  const clourinaryUrl = await uploadOnCloudinary(avatarPath, "Blog-API/avatar");

  const registeredUser = await registerUserService({
    ...data,
    avatar: clourinaryUrl?.secure_url, // passing just url not the cloudinary object
  });
  return res
    .status(200)
    .json(new ApiResponse(201, registeredUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res, next) => {
  const data = req.body;

  const loggedInUser = await loginUserService(data);

  return res
    .status(200)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {

  

});

export { registerUser, loginUser, refreshAccessToken };
