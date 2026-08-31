import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../middleware/multer.middleware.js";

import {
  changePassword,
  deleteNotification,
  deleteReadNotifications,
  deleteUserProfile,
  getUserNotifications,
  getUserOrder,
  getUserOrders,
  getUserProfile,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  setDefaultAddress,
  updateUserProfile,
} from "../controller/user.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/profile", getUserProfile);

router.patch("/profile", upload.single("avatar"), updateUserProfile);

router.patch("/change-password", changePassword);

router.delete("/profile", deleteUserProfile);

router.get("/orders", getUserOrders);

router.get("/orders/:orderId", getUserOrder);

router.patch("/addresses/:addressId/default", setDefaultAddress);

router.get("/notifications", getUserNotifications);

router.patch("/notifications/:notificationId/read", markNotificationAsRead);

router.patch("/notifications/read-all", markAllNotificationsAsRead);

router.delete("/notifications/:notificationId", deleteNotification);

router.delete("/notifications/read", deleteReadNotifications);

export default router;
