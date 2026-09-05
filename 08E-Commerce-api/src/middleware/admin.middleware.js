import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../modules/users/model/user.model.js";

export const adminMiddleware = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id; // userId from authmiddleware

  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const user = await User.findById(userId).select("role isActive");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User account is inactive");
  }

  if (user.role !== "ADMIN") {
    throw new ApiError(403, "Admin access required");
  }

  next();
});
