import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
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

  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;

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

  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;

  return { user: safeUser, accessToken, refreshToken };
};

export { registerUserService, loginUserService };
