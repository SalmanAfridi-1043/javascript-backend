import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { createSafeUser } from "../utils/sanitizeUser.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import jwt from "jsonwebtoken";
import { validateSearchData } from "../validators/user.validator.js";

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

export { getUserByIdService, searchUsersService };
