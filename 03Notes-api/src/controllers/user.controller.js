import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
  registerService,
  loginService,
  logoutService,
  refreshTokenService,
} from "../services/auth.service.js";

const registerUser = async (req, res, next) => {
  try {
    const data = req.body;
    const user = await registerService(data);
    return res
      .status(201)
      .json(new ApiResponse(201, user, "User registered successfully"));
  } catch (error) {
    next(error);
  }
};
const loginUser = async (req, res, next) => {};
const logoutUser = async (req, res, next) => {};
const refreshAccessToken = async (req, res, next) => {};

export { registerUser, loginUser, logoutUser, refreshAccessToken };
