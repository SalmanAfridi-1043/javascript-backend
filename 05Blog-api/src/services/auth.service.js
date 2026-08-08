import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";

import { validateRegisterInput } from "../validators/auth.validator.js";

const registerUserService = async (data) => {
  const { fullName, username, email, password } = validateRegisterInput(data);

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
  });

  const safeUser = userDocument.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;

  return safeUser;
};

export { registerUserService };
