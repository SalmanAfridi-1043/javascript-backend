import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { createSafeUser } from "../utils/sanitizeUser.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import jwt from "jsonwebtoken";

import {
  validateSearchData,
  validateUpdateData,
} from "../validators/user.validator.js";

const getUserByIdService = async (userId) => {
  validateRequired(userId, "user id");

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const safeuser = createSafeUser(user);

  return safeuser;
};

const searchUsersService = async (searchData) => {
  const { search, page, limit } = validateSearchData(searchData);

  const skip = (page - 1) * limit;

  const searchQuery = {
    $or: [
      { fullName: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
    ],
  };

  const allUsers = await User.find(searchQuery)
    .skip(skip)
    .limit(limit)
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });

  const totalUsers = await User.countDocuments(searchQuery);
  const pages = Math.ceil(totalUsers / limit);
  const previousPage = page > 1;
  const nextPage = page < pages;

  return {
    allUsers,
    total: totalUsers,
    pages,
    page,
    limit,
    previousPage,
    nextPage,
  };
};

const updateUserProfileService = async (userId, updateData) => {
  validateRequired(userId, "user id");
  const { fullName, username, email } = validateUpdateData(updateData);

  // check if username already exists
  if (username !== undefined) {
    const isUsernameExists = await User.findOne({
      username,
      _id: { $ne: userId }, // exclude the current user (ne- not equal to)
    });
    if (isUsernameExists) {
      throw new ApiError(409, "Username already exists");
    }
  }

  // check if email already exists
  if (email !== undefined) {
    const isEmailExists = await User.findOne({
      email,
      _id: { $ne: userId }, // exclude the current user (ne- not equal to)
    });
    if (isEmailExists) {
      throw new ApiError(409, "Email already exists");
    }
  }

  const updateObject = {};
  if (fullName !== undefined) updateObject.fullName = fullName;
  if (username !== undefined) updateObject.username = username;
  if (email !== undefined) updateObject.email = email;

  // prevent empty update. coz it can cause $set:{} which undefined all the fields
  if (Object.keys(updateObject).length === 0) {
    throw new ApiError(400, "No fields to update");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: updateObject,
    },
    {
      new: true,
      runValidators: true, // it runs the mongoose schema validation during update
    },
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const safeUser = createSafeUser(user);

  return safeUser;
};

const updateUserAvatarService = async (userId, avatar) => {
  validateRequired(userId, "User id");

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        avatar,
      },
    },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const safeUser = createSafeUser(user);
  return safeUser;
};

export {
  getUserByIdService,
  searchUsersService,
  updateUserProfileService,
  updateUserAvatarService,
};
