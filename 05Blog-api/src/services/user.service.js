import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { createSafeUser } from "../utils/sanitizeUser.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import jwt from "jsonwebtoken";

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



export { getUserProfileService, updateUserProfileService };
