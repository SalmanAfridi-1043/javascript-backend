import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { createSafeUser } from "../utils/sanitizeUser.js";
import jwt, { decode } from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../validators/auth.validator.js";

const registerUserService = async (data) => {
  const { fullName, username, email, password } = validateRegisterInput(data);

  const isUsernameExist = await User.findOne({ username });
  if (isUsernameExist) {
    throw new ApiError(400, "username already exists");
  }

  const isEmailExist = await User.findOne({ email });
  if (isEmailExist) {
    throw new ApiError(400, "email already exists");
  }

  //   const isUserExist = await User.findOne({
  //     $or: [{ username }, { email }],
  //   });
  //   if (isUserExist) {
  //     throw new ApiError(400, "User with username or email already exists");
  //   }

  const saltRounds = process.env.BCRYPT_SALT_ROUNDS;

  const hashedPassword = await bcrypt.hash(password, saltRounds);

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
  // loginIdentifier maybe username or email
  const { loginIdentifier, password } = validateLoginInput(data);

  const user = await User.findOne({
    $or: [{ username: loginIdentifier }, { email: loginIdentifier }],
  });

  if (!user) {
    throw new ApiError(404, "Invalid credentials");
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
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  // its return true if correct
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );

  if (!decodedToken || !decodedToken.userId) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const newAccessToken = generateAccessToken(user?._id);

  //generating new refresh token for more security
  const newRefreshToken = generateRefreshToken(user?._id);

  user.refreshToken = newRefreshToken;
  await user.save();

  return { newAccessToken, newRefreshToken };
};

const logoutUserService = async (userId) => {
  if (!userId) {
    throw new ApiError(404, "User id not found");
  }

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
    throw new ApiError(401, "Unauthorized");
  }

  return {
    success: true,
  };
};

export {
  registerUserService,
  loginUserService,
  refreshAccessTokenService,
  logoutUserService,
};
