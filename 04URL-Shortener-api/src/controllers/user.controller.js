import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cookieOptions } from "../utils/cookieOptions.js";
import {
  registerUserService,
  loginUserService,
  refreshAccessTokenService,
  logoutUserService,
} from "../services/user.service.js";

const registerUser = asyncHandler(async (req, res, next) => {
  const data = req.body;

  const user = await registerUserService(data);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res, next) => {
  const data = req.body;

  const loggedInUser = await loginUserService(data);

  const { accessToken, refreshToken, user } = loggedInUser;

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User logged in successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies || req.body;

  const response = await refreshAccessTokenService(refreshToken);

  const { accessToken, refreshToken } = response;

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Access token refreshed successfully"));
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
