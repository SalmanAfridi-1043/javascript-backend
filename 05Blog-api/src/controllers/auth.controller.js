import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { cookieOptions } from "../utils/cookieOptions.js";

import {
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
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

  const response = await loginUserService(data);

  const { accessToken, refreshToken, user } = response;

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User logged in successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  const response = await refreshAccessTokenService(refreshToken);

  const { newAccessToken, newRefreshToken } = response;

  res.cookie("accessToken", newAccessToken, cookieOptions);
  res.cookie("refreshToken", newRefreshToken, cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Token refreshed successfully"));
});

const logoutUser = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  const response = await logoutUserService(userId);

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "User logged out successfully"));
});

export { registerUser, loginUser, refreshAccessToken, logoutUser };
