import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { createSafeUser } from "../utils/sanitizeUser.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import jwt from "jsonwebtoken";

import {
  validateRegisterInput,
  validateLoginInput,
} from "../validators/auth.validator.js";

const registerUserService = async (data) => {
  const { fullName, username, email, password, bio } =
    validateRegisterInput(data);

  // revieving public avatarUrl from data
  const avatar = data.avatar;

  const isUserExists = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserExists) {
    throw new ApiError(400, "Username or email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    process.env.BCRYPT_SALT_ROUNDS,
  );

  const userDocument = await User.create({
    fullName,
    username,
    email,
    password: hashedPassword,
    avatar,
    bio,
  });

  const safeUser = createSafeUser(userDocument);

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

  return { user: safeUser, accessToken, refreshToken };
};

const refreshAccessTokenService = async (incomingRefreshToken) => {
  validateRequired(incomingRefreshToken, "Refresh token");

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );

  if (!decodedToken || !decodedToken.userId) {
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
  await user.save();

  return { newAccessToken, newRefreshToken };
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
    throw new ApiError(401, "Unauthorized user");
  }

  return { success: true };
};

export {
  registerUserService,
  loginUserService,
  refreshAccessTokenService,
  logoutUserService,
};
