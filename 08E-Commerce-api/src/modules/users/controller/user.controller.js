import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import uploadOnCloudinary from "../../../config/cloudinary.config.js";

import {
  changePasswordService,
  deleteUserProfileService,
  getUserNotificationsService,
  getUserOrdersService,
  getUserProfileService,
  markAllNotificationsAsReadService,
  markNotificationAsReadService,
  setDefaultAddressService,
  updateUserProfileService,
} from "../service/user.service.js";

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const userProfile = await getUserProfileService(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, userProfile, "User profile fetched successfully"),
    );
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const updateData = { ...req.body };

  const avatarPath = req.file?.path;

  if (avatarPath) {
    const cloudinaryUrl = await uploadOnCloudinary(
      avatarPath,
      "E-Commerce-API/avatar",
    );

    updateData.avatar = cloudinaryUrl?.secure_url;
  }
  const updatedProfile = await updateUserProfileService(userId, updateData);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedProfile, "User profile updated successfully"),
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const incomingPasswords = req.body;

  const updatedUserProfile = await changePasswordService(
    userId,
    incomingPasswords,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUserProfile, "Passowrd updated successfully"),
    );
});

const deleteUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const response = await deleteUserProfileService(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "User profile deleted successfully"));
});

const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const paginationData = req.query;

  const allOrders = await getUserOrdersService(userId, paginationData);

  return res
    .status(200)
    .json(new ApiResponse(200, allOrders, "User orders fetched successfully"));
});

const getUserOrder = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { orderId } = req.params;

  const order = await getUserOrdersService(userId, orderId);

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { addressId } = req.params;

  const defaultAddress = await setDefaultAddressService(userId, addressId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, defaultAddress, "Default address set successfully"),
    );
});

const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const paginationData = req.query;

  const allNotifications = await getUserNotificationsService(
    userId,
    paginationData,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allNotifications,
        "Notifications fetched successfully",
      ),
    );
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
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
        "Notification marked as read successfully",
      ),
    );
});

const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const markedAllNotifications =
    await markAllNotificationsAsReadService(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        markedAllNotifications,
        "Notifications marked as read successfully",
      ),
    );
});

export {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserProfile,
  getUserOrders,
  getUserOrder,
  setDefaultAddress,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
