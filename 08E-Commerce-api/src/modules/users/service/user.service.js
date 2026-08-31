import { ApiError } from "../../../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";
import { validateNotFound } from "../../../utils/validateNotFound.js";
import { createSafeUser } from "../../../utils/sanitizeUser.js";

const getUserProfileService = async (userId) => {
  validateRequired(userId, "User id");

  const user = await User.findById(userId);

  validateNotFound(user);

  const safeUser = createSafeUser(user);

  return { user: safeUser };
};

export { getUserProfileService };
