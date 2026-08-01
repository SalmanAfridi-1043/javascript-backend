import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";

const registerService = async (userData) => {
  const { username, email, fullName, password } = userData;

  // now check all above fields are required

  if (!username) {
    throw new ApiError(400, "Username is required");
  }
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  if (!fullName) {
    throw new ApiError(400, "Full name is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // normalize the email,fullname and username to lowercase
  const normalizedEmail = email.toLowerCase();
  const normalizedFullName = fullName.trim();
  const normalizedUsername = username.toLowerCase();

  // console.log all the fields
  console.log({
    username: normalizedUsername,
    email: normalizedEmail,
    fullName: normalizedFullName,
    password: hashedPassword,
  });

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
  user.password = undefined;
  user.refreshToken = undefined;
  return user;
};
const loginService = () => {};
const logoutService = () => {};
const refreshTokenService = () => {};

export { registerService, loginService, logoutService, refreshTokenService };
