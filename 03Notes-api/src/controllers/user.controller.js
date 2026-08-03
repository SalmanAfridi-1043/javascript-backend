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

const loginUser = async (req, res, next) => {
  try {
    const loginData = req.body;

    const loggedInUser = await loginService(loginData);

    return res
      .status(200)
      .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(404, "Refresh Token is required");
    }

    const accessToken = await refreshTokenService(refreshToken);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          accessToken,
          "Access token refreshed successfully",
        ),
      );
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    const loggedOutUser = await logoutService(userId);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          loggedOutUser,
        },
        "User logged out successfully",
      ),
    );
  } catch (error) {
    next(error);
  }
};

export { registerUser, loginUser, logoutUser, refreshAccessToken };
