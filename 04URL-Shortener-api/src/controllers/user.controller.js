import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { registerUserService } from "../services/user.service.js";

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

  return res
    .status(200)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

export { registerUser };
