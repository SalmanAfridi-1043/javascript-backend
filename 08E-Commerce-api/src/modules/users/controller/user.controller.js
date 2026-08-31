import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import uploadOnCloudinary from "../../../config/cloudinary.config.js";

import {
  getUserProfileService,
  updateUserProfileService,
} from "../service/user.service.js";

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const userProfile = await getUserProfileService(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, userProfile, "User profile fetched successfully"),
    );
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const updateData = { ...req.body };

  const avatarPath = req.file?.path;

  if (avatarPath) {
    const cloudinaryUrl = await uploadOnCloudinary(
      avatarPath,
      "E-Commerce-API/avatar",
    );

    updateData.avatar = cloudinaryUrl?.secure_url;
  }
  const updatedProfile = await updateUserProfileService(userId, updateData);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedProfile, "User profile updated successfully"),
    );
});

export { getUserProfile, updateUserProfile };
