import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiError.js";

import { registerUserService } from "../services/auth.service.js";

const registerUser = asyncHandler(async (req, res, next) => {
  const data = req.body;

  const registeredUser = await registerUserService(data);

  return res
    .status(200)
    .json(new ApiResponse(200, registerUser, "User registered successfully"));
});

export { registerUser };
