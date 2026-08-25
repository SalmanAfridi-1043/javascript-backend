import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import {
  getUserByIdService,
  searchUsersService,
  updateUserAvatarService,
  updateUserProfileService,
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

const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const updateData = req.body;

  const updatedUser = await updateUserProfileService(userId, updateData);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const avatarPath = req.file?.path;

  if (!avatarPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const cloudinaryUrl = await uploadOnCloudinary(
    avatarPath,
    "ChatBackend-API/avatar",
  );
  
  const avatar = cloudinaryUrl?.secure_url;

  const updatedUser = await updateUserAvatarService(userId, avatar);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User avatar updated successfully"),
    );
});

export { getUserById, searchUsers, updateUserProfile, updateUserAvatar };
