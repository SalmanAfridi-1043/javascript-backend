import { ApiError } from "../../../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { Order } from "../../orders/model/order.model.js";
import { Address } from "../../addresses/model/address.model.js";
import { Notification } from "../../notifications/model/notification.model.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";
import { validateNotFound } from "../../../utils/validateNotFound.js";
import { createSafeUser } from "../../../utils/sanitizeUser.js";
import bcrypt from "bcrypt";

import {
  validateNewPassword,
  validatePaginateData,
  validateUpdateData,
} from "../validator/user.validator.js";

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

const changePasswordService = async (userId, incomingPasswords) => {
  validateRequired(userId, "User id");

  const { currentPassword, newPassword } =
    validateNewPassword(incomingPasswords);

  const user = await User.findById(userId);
  validateNotFound(user, "User");

  const isCurrentPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password,
  );

  if (!isCurrentPasswordCorrect) {
    throw new ApiError(
      401,
      "Unauthorized access!. Current password is invalid",
    );
  }

  const hashNewPassword = await bcrypt.hash(
    newPassword,
    process.env.BCRYPT_SALT_ROUNDS,
  );

  user.password = hashNewPassword;

  // Null the refreshToken to log out existing sessions after a password change, so an old refresh token can't be used to generate a new access token.
  user.refreshToken = undefined;
  await user.save();

  const safeUser = createSafeUser(user);

  return safeUser;
};

const deleteUserProfileService = async (userId) => {
  validateRequired(userId, "User id");

  // soft delete so that the entry remain in DB for refrence
  // because we may need the user's historical:Orders,Payments,Reviews,CouponUsage
  // Your existing isActive field was designed for this purpose.
  const user = await User.findByIdAndUpdate(userId, {
    $set: {
      isActive: false,
      refreshToken: undefined,
    },
  });

  validateNotFound(user, "User");

  return { success: true };
};

const getUserOrdersService = async (userId, paginationData) => {
  validateRequired(userId, "User id");

  const { page, limit } = validatePaginateData(paginationData);

  const skip = (page - 1) * limit;

  const allOrders = await Order.find({
    user: userId,
  })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalOrders = await Order.countDocuments({ user: userId });

  const pages = Math.ceil(totalOrders / limit);
  const previousPage = page > 1;
  const nextPage = page < pages;

  return {
    allOrders,
    total: totalOrders,
    page,
    limit,
    previousPage,
    nextPage,
  };
};

const getUserOrderService = async (userId, orderId) => {
  validateRequired(userId, "User id");
  validateRequired(orderId, "Order id");

  validateObjectId(orderId, "order");

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  }).populate("user", "-password -refreshToken");

  return order;
};

const setDefaultAddressService = async (userId, addressId) => {
  validateRequired(userId, "User id");
  validateRequired(addressId, "Address id");

  validateObjectId(addressId, "Address");

  // find the current address first
  const address = await Address.findOne({
    _id: addressId,
    user: userId,
  });

  validateNotFound(address, "Address");

  // before assigning the current address as default, set all the rest of addresses as isDefault=false, bcz only one address can de default address
  await Address.updateMany(
    {
      user: userId,
    },
    {
      $set: { isDefault: true },
    },
  );

  // now set the current address as default address
  address.isDefault = true;

  await address.save();

  return address;
};

const getUserNotificationsService = async (userId, paginationData) => {
  validateRequired(userId, "User id");

  const { page, limit } = validatePaginateData(paginationData);

  const skip = (page - 1) * limit;

  const notifications = await Notification.find({
    user: userId,
  })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalNotifications = await Notification.countDocuments({
    user: userId,
  });

  const pages = Math.ceil(totalNotifications / limit);
  const previousPage = page > 1;
  const nextPage = page < pages;

  return {
    notifications,
    total: totalNotifications,
    page,
    limit,
    previousPage,
    nextPage,
  };
};

const markNotificationAsReadService = async (userId, notificationId) => {
  validateRequired(userId, "User id");
  validateRequired(notificationId, "Notification id");

  validateObjectId(notificationId, "Notification");

  const markedNotification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      user: userId,
    },
    {
      $set: { isRead: true },
    },
    {
      new: true,
    },
  );

  validateNotFound(markedNotification, "Notification");

  return markedNotification;
};

const markAllNotificationsAsReadService = async (userId) => {
  validateRequired(userId, "User id");

  const markedAllNotifications = await Notification.updateMany(
    {
      user: userId,
      isRead: false,
    },
    {
      $set: { isRead: true },
    },
    {
      new: true,
    },
  );

  return markedAllNotifications;
};

const deleteNotificationService = async (userId, notificationId) => {
  validateRequired(userId, "User id");
  validateRequired(notificationId, "Notification id");

  validateObjectId(notificationId, "Notification");

  const deletedNotification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });

  validateNotFound(deletedNotification, "Notification");

  return { success: true };
};

const deleteReadNotificationsService = async (userId) => {
  validateRequired(userId, "User id");

  const result = await Notification.deleteMany({
    user: userId,
    isRead: true,
  });

  //deleteMany(): returns something like:{ acknowledged: true, deletedCount: 5 }

  if (result.deletedCount === 0) {
    throw new ApiError(404, "No read notifications found");
  }

  return {
    deletedCount: result.deletedCount,
  };
};

export {
  getUserProfileService,
  updateUserProfileService,
  changePasswordService,
  deleteUserProfileService,
  getUserOrdersService,
  getUserOrderService,
  setDefaultAddressService,
  getUserNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  deleteNotificationService,
  deleteReadNotificationsService,
};
