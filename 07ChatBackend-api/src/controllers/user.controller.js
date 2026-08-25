import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import {
  getUserByIdService,
  searchUsersService,
} from "../services/user.service.js";

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await getUserByIdService(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

const searchUsers = asyncHandler(async (req, res) => {
  const searchData = req.query;

  const users = await searchUsersService(searchData);

  return res
    .status(200)
    .json(new ApiResponse(200, users, "All users fetched successfully"));
});

export { getUserById, searchUsers };
