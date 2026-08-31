import { ApiError } from "../../../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";
import { validateNotFound } from "../../../utils/validateNotFound.js";
import { createSafeUser } from "../../../utils/sanitizeUser.js";
import bcrypt from "bcrypt";
import {
  validateNewPassword,
  validateUpdateData,
} from "../validator/user.validator.js";

const getUserProfileService = async (userId) => {
  validateRequired(userId, "User id");

  const user = await User.findById(userId);

  validateNotFound(user, "User");

  const safeUser = createSafeUser(user);

  return { user: safeUser };
};

const updateUserProfileService = async (userId, updateData) => {
  validateRequired(userId, "User id");

  const { fullName, username, email } = validateUpdateData(updateData);
  const { avatar } = updateData;

  const updateObject = {};
  if (fullName !== undefined) {
    updateObject.fullName = fullName;
  }
  if (email !== undefined) {
    updateObject.email = email;
  }
  if (username !== undefined) {
    updateObject.username = username;
  }
  if (avatar !== undefined) {
    updateObject.avatar = avatar;
  }

  const isUserExists = await User.findById(userId);
  validateNotFound(isUserExists, "User");
  const isUsernameOrEmailExists = await User.findOne({
    _id: { $ne: userId },
    $or: [{ username }, { email }],
  });

  if (isUsernameOrEmailExists) {
    throw new ApiError(409, "Username or email already exists");
  }

  const updateUserProfile = await User.findByIdAndUpdate(
    userId,
    {
      $set: updateObject,
    },
    { new: true },
  );

  const safeProfile = createSafeUser(updateUserProfile);

  return safeProfile;
};

const changePasswordService = async (userId, incomingPasswords) => {
  validateRequired(userId, "User id");

  const { currentPassword, newPassword } =
    validateNewPassword(incomingPasswords);

  const user = await User.findById(userId);
  validateNotFound(user, "User");

  const isCurrentPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password,
  );

  if (!isCurrentPasswordCorrect) {
    throw new ApiError(
      401,
      "Unauthorized access!. Current password is invalid",
    );
  }

  const hashNewPassword = await bcrypt.hash(
    newPassword,
    process.env.BCRYPT_SALT_ROUNDS,
  );

  user.password = hashNewPassword;

  // Null the refreshToken to log out existing sessions after a password change, so an old refresh token can't be used to generate a new access token.
  user.refreshToken = undefined;
  await user.save();

  const safeUser = createSafeUser(user);

  return safeUser;
};

export {
  getUserProfileService,
  updateUserProfileService,
  changePasswordService,
};
