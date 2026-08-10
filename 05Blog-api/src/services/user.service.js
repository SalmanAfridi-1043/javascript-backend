import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { createSafeUser } from "../utils/sanitizeUser.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import jwt from "jsonwebtoken";
import { Follow } from "../models/follow.model.js";
import { Post } from "../models/post.model.js";

const getUserProfileService = async (userId) => {
  validateRequired(userId, "User id");

  const profile = await User.findById(userId);

  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  const safeProfile = createSafeUser(profile);

  return safeProfile;
};

const updateUserProfileService = async (userId, data) => {
  const { fullName, bio, avatar } = data;

  validateObjectId(userId, "User");

  const updateData = {}; // dynamic object to store only valid data (to avoid overwrite field with undefined)

  if (!fullName !== undefined) {
    updateData.fullName = fullName.trim();
  }
  if (!bio !== undefined) {
    updateData.bio = bio.trim();
  }
  if (!avatar !== undefined) {
    updateData.avatar = avatar;
  }

  const userProfile = await User.findByIdAndUpdate(
    userId,
    {
      $set: updateData,
    },
    {
      new: true,
    },
  );

  if (!userProfile) {
    throw new ApiError(404, "User not found");
  }

  const safeProfile = createSafeUser(userProfile);
  return safeProfile;
};

const getUserByUsernameService = async (username) => {
  const normalizedUsername = username?.trim().toLowerCase();

  validateRequired(normalizedUsername, "Username");

  const user = await User.findOne({ username: normalizedUsername });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const safeUser = createSafeUser(user);

  return safeUser;
};

const followUserService = async (currentUserId, targetUsername) => {
  const normalizedTargetUsername = targetUsername?.trim().toLowerCase();

  validateRequired(currentUserId, "User id");
  validateRequired(normalizedTargetUsername, "Username");

  const targetUser = await User.findOne({ username: normalizedTargetUsername });
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  if (currentUserId.equals(targetUser._id)) {
    throw new ApiError(400, "User cannot follow itself");
  }

  const isAlreadyFollowed = await Follow.findOne({
    follower: currentUserId,
    following: targetUser._id,
  });

  if (isAlreadyFollowed) {
    throw new ApiError(409, "Already following this user");
  }

  const followedUser = await Follow.create({
    follower: currentUserId,
    following: targetUser._id,
  });

  return followedUser;
};

const unfollowUserService = async (currentUserId, targetUsername) => {
  const normalizedTargetUsername = targetUsername?.trim().toLowerCase();

  validateRequired(currentUserId, "User id");
  validateRequired(normalizedTargetUsername, "Username");

  const targetUser = await User.findOne({ username: normalizedTargetUsername });
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const followDocument = await Follow.findOneAndDelete({
    follower: currentUserId,
    following: targetUser._id,
  });

  if (!followDocument) {
    throw new ApiError(404, "You are not following this user");
  }

  return { success: true };
};

const getUserFollowersService = async (targetUsername) => {
  const normalizedTargetUsername = targetUsername?.trim().toLowerCase();

  const targetUser = await User.findOne({ username: normalizedTargetUsername });

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const followers = await Follow.find({
    following: targetUser._id,
  }).populate("follower", "-password -refreshToken");

  if (!followers.length) {
    return [];
  }

  const result = followers.map((follow) => ({
    ...follow.toObject(),
    follower: createSafeUser(follow.follower),
  }));

  return result;
};

const getUserFollowingService = async (targetUsername) => {
  const normalizedTargetUsername = targetUsername?.trim().toLowerCase();

  const targetUser = await User.findOne({ username: normalizedTargetUsername });

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const following = await Follow.find({
    follower: targetUser._id,
  }).populate("following", "-password -refreshToken");

  if (!following.length) {
    return [];
  }

  const result = following.map((eachFollowing) => ({
    ...eachFollowing.toObject(),
    follower: createSafeUser(eachFollowing.following),
  }));

  return result;
};

const getAllPostsService = async (username) => {
  const normalizedTargetUsername = username?.trim().toLowerCase();

  const targetUser = await User.findOne({ username: normalizedTargetUsername });

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const posts = await Post.find({
    author: targetUser._id,
  }).populate("author", "-password -refreshToken");
  // populate - convert the user/objectId to actual user/object document. (used for details info)
  // populate() = fetch the referenced document instead of only its ID.

  return posts;
};

export {
  getUserProfileService,
  updateUserProfileService,
  getUserByUsernameService,
  followUserService,
  unfollowUserService,
  getUserFollowersService,
  getUserFollowingService,
  getAllPostsService,
};
