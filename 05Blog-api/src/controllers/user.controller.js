import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { cookieOptions } from "../utils/cookieOptions.js";

import {
  followUserService,
  getAllPostsService,
  getUserByUsernameService,
  getUserFollowersService,
  getUserFollowingService,
  getUserProfileService,
  unfollowUserService,
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

const getUserByUsername = asyncHandler(async (req, res, next) => {
  const username = req.params.username;

  const userProfile = await getUserByUsernameService(username);

  return res
    .status(200)
    .json(
      new ApiResponse(200, userProfile, "User profile fetched successfully"),
    );
});

const followUser = asyncHandler(async (req, res, next) => {
  const currentUserId = req.user?._id;
  const targetUsername = req.params?.username; // to follow user on this username

  const followedUser = await followUserService(currentUserId, targetUsername);

  return res
    .status(200)
    .json(new ApiResponse(200, followedUser, "User followed successfully"));
});

const unfollowUser = asyncHandler(async (req, res, next) => {
  const currentUserId = req.user?._id;
  const targetUsername = req.params?.username; // to follow user on this username

  const response = await unfollowUserService(currentUserId, targetUsername);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "User unfollowed successfully"));
});

const getUserFollowers = asyncHandler(async (req, res, next) => {
  const targetUsername = req.params?.username;

  const followers = await getUserFollowersService(targetUsername);

  return res
    .status(200)
    .json(
      new ApiResponse(200, followers, "User followers fetched successfully"),
    );
});

const getUserFollowing = asyncHandler(async (req, res, next) => {
  const targetUsername = req.params?.username;

  const following = await getUserFollowingService(targetUsername);

  return res
    .status(200)
    .json(
      new ApiResponse(200, following, "User following fetched successfully"),
    );
});

const getAllPosts = asyncHandler(async (req, res, next) => {
  const username = req.params?.username;

  const allPosts = await getAllPostsService(username);

  return res
    .status(200)
    .json(new ApiResponse(200, allPosts, "All posts fetched successfully"));
});

export {
  getUserProfile,
  updateUserProfile,
  getUserByUsername,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  getAllPosts,
};
