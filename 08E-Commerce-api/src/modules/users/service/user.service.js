import { ApiError } from "../../../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";
import { validateNotFound } from "../../../utils/validateNotFound.js";
import { createSafeUser } from "../../../utils/sanitizeUser.js";
import { validateUpdateData } from "../validator/validateUpdateData.js";

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

export { getUserProfileService, updateUserProfileService };
