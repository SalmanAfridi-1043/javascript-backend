import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { createSafeUser } from "../utils/sanitizeUser.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import bcrypt from "bcrypt";
import jwt, { decode } from "jsonwebtoken";

import {
  validateLoginInput,
  validateRegisterInput,
} from "../validators/auth.validator.js";
import { use } from "react";

const registerUserService = async (data) => {
  const { fullName, username, email, password } = validateRegisterInput(data);

  const isUserExists = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserExists) {
    throw new ApiError(400, "User alread exists");
  }

  const hashedPassword = bcrypt.hash(password, process.env.BCRYPT_SALT_ROUNDS);

  const user = await User.create({
    fullName,
    username,
    email,
    password: hashedPassword,
  });

  const safeUser = createSafeUser(user);

  return safeUser;
};

const loginUserService = async (data) => {
  const { loginIdentifier, password } = validateLoginInput(data);

  const user = await User.findOne({
    $or: [{ username: loginIdentifier }, { email: loginIdentifier }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  const safeUser = createSafeUser(user);

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

const refreshAccessTokenService = async (incomingRefreshToken) => {
  validateRequired(incomingRefreshToken, "Refresh token");

  const decodedToken = await jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );

  if (!decodedToken || !decodedToken?.userId) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  user.save();

  return {
    newAccessToken,
    newRefreshToken,
  };
};

const logoutUserService = async (userId) => {
  validateRequired(userId, "User id");

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    },
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return { success: true };
};

export {
  registerUserService,
  loginUserService,
  refreshAccessTokenService,
  logoutUserService,
};
