import { ApiError } from "../utils/ApiError.js";
import { validateRegisterInput } from "../validators/auth.validator.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";

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

export { registerUserService };
