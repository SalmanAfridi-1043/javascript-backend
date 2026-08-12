import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { getMyNotificationsService } from "../services/notification.service.js";

const getMyNotifications = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  const allNotifications = await getMyNotificationsService(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allNotifications,
        "All notifications fetched successfully",
      ),
    );
});

export { getMyNotifications };
