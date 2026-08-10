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

export { getUserProfileService };
