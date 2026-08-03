import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import { isValidObjectId } from "mongoose";

const registerService = async (userData) => {
  const { username, email, fullName, password } = userData;

  // now check all above fields are required

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }
  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }
  if (!fullName?.trim()) {
    throw new ApiError(400, "Full name is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // normalize the email,fullname and username to lowercase
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedFullName = fullName?.trim().toLowerCase();
  const normalizedUsername = username?.trim().toLowerCase();

  // now check if user already exists
  const isUserExist = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });
  if (isUserExist) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  // now hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // now create user
  const user = await User.create({
    username: normalizedUsername,
    email: normalizedEmail,
    fullName: normalizedFullName,
    password: hashedPassword,
  });

  // now remove password and refreshToken from user object before returning

  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;

  return safeUser;
};

const loginService = async (loginData) => {
  const { email, username, password } = loginData;

  // check if email or username is provided
  if (!email && !username) {
    throw new ApiError(400, "Email or username is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // normalize the email and username to lowercase
  const normalizedEmail = email ? email.trim().toLowerCase() : null;
  const normalizedUsername = username ? username.trim().toLowerCase() : null;

  const user = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // now check if password is correct
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid password");
  }

  const accessToken = generateAccessToken(user._id);

  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  //remove the sensative fields from user object before returning
  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;

  return { user: safeUser, accessToken, refreshToken };
};

const refreshTokenService = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  // verify the refresh token
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

  //compare stored refresh token
  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // generate new access token
  const newAccessToken = generateAccessToken(user._id);

  return { accessToken: newAccessToken };
};

const logoutService = async (userId) => {
  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $unset: { refreshToken: 1 } },
    { new: true },
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    username: user.username,
    email: user.email,
  };
};

export { registerService, loginService, logoutService, refreshTokenService };
