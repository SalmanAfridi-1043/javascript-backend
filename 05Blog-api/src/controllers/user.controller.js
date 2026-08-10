import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { cookieOptions } from "../utils/cookieOptions.js";

import { getUserProfileService } from "../services/user.service.js";

const getUserProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  const userProfile = await getUserProfileService(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, userProfile, "User profile fetched successfully"),
    );
});

export { getUserProfile };
