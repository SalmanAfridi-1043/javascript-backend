import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { cookieOptions } from "../utils/cookieOptions.js";

import {
  getUserProfileService,
  updateUserProfileService,
} from "../services/user.service.js";
import { useId } from "react";

const getUserProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  const userProfile = await getUserProfileService(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, userProfile, "User profile fetched successfully"),
    );
});

const updateUserProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const data = req.body;

  // so, if avatar exists, then cloudinary will be called.(below process shows this)
  let avatarPath;
  if (req.file) {
    const cloudinaryUrl = await uploadOnCloudinary(
      avatarPath,
      "Blog-API/avatar",
    );

    avatarPath = cloudinaryUrl.secure_url;
  }

  const updatedProfile = await updateUserProfileService(userId, {
    ...data,
    ...(avatarPath && { avatar: avatarPath }), // only add if avatar exist else not
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedProfile, "User profile updated successfully"),
    );
});

export { getUserProfile, updateUserProfile };
