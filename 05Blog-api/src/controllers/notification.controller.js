import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
  deleteNotificationService,
  getMyNotificationsService,
  markAllNotificationAsReadService,
  markNotificationAsReadService,
} from "../services/notification.service.js";

const getMyNotifications = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const { page, limit } = req.query;

  const allNotifications = await getMyNotificationsService(userId, page, limit);

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

const markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const { notificationId } = req.params;

  const markedNotification = await markNotificationAsReadService(
    userId,
    notificationId,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        markedNotification,
        "Marked notification as read successfully",
      ),
    );
});

const markAllNotificationAsRead = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  const markedAllNotification = await markAllNotificationAsReadService(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        markedAllNotification,
        "Marked all notification as read successfully",
      ),
    );
});

const deleteNotification = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const { notificationId } = req.params;

  const response = await deleteNotificationService(userId, notificationId);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Notification deleted successfully"));
});

export {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationAsRead,
  deleteNotification,
};
