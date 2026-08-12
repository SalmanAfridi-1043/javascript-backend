import { ApiError } from "../utils/ApiError.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { Notification } from "../models/notification.model.js";

const getMyNotificationsService = async (userId, page, limit) => {
  validateRequired(userId, "User id");

  page = Number(page) || 1;
  limit = Number(limit) || 20;

  if (page < 1) page = 1;
  if (limit < 1) limit = 20;

  const skip = (page - 1) * limit;

  // get all recieved notifications
  const receivedNotifications = await Notification.find({
    recipient: userId, // recipient means reciever
  })
    .populate("sender", "-password -refreshToken")
    .populate("post")
    .populate("comment")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (receivedNotifications.length === 0) {
    return {
      receivedNotifications: [],
      pagination: {
        currentPage: page,
        limit,
        totalNotifications: 0,
        totalPages: 0,
      },
    };
  }

  const totalNotifications = await Notification.countDocuments({
    recipient: userId,
  });

  const totalPages = Math.ceil(totalNotifications / limit);

  return {
    receivedNotifications,
    pagination: {
      currentPage: page,
      limit,
      totalNotifications,
      totalPages,
    },
  };
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
