import { ApiError } from "../utils/ApiError.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { Notification } from "../models/notification.model.js";

const getMyNotificationsService = async (userId) => {
  validateRequired(userId, "User id");

  // get all recieved notifications
  const receivedNotifications = await Notification.find({
    recipient: userId,
  })
    .populate("sender", "-password -refreshToken")
    .populate("post")
    .populate("comment")
    .sort({ createdAt: -1 });

  if (receivedNotifications.length === 0) {
    return [];
  }

  return receivedNotifications;
};

const markNotificationAsReadService = async (userId, notificationId) => {
  validateRequired(userId, "User id");
  validateRequired(notificationId, "Notification id");

  validateObjectId(notificationId, "Notification");

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId,
    },
    {
      $set: {
        isRead: true,
      },
    },
    {
      new: true,
    },
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return notification;
};

const markAllNotificationAsReadService = async (userId) => {
  validateRequired(userId, "User id");

  // find all unread notifications and marked as read
  // updateMany() returns modifiedCount=0 when no changes occure
  const markedAllNotifications = await Notification.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    },
  );

  return {
    success: true,
    markedReadCount: markedAllNotifications.modifiedCount,
  };
};

const deleteNotificationService = async (userId, notificationId) => {
  validateRequired(userId, "User id");
  validateRequired(notificationId, "Notification id");

  validateObjectId(notificationId, "Notification");

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return {
    success: true,
  };
};

export {
  getMyNotificationsService,
  markNotificationAsReadService,
  markAllNotificationAsReadService,
  deleteNotificationService,
};
