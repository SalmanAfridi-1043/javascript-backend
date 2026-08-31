import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

import { getUserProfileService } from "../service/user.service.js";

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const userProfile = await getUserProfileService(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, userProfile, "User profile fetched successfully"),
    );
});

export { getUserProfile };
