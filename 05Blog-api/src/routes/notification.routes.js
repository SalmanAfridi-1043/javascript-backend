import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  deleteNotification,
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationAsRead,
  markNotificationAsRead,
  notificationsCleanup,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getMyNotifications);
router.patch("/:notificationId/read", markNotificationAsRead);
router.patch("/read-all", markAllNotificationAsRead);
router.delete("/:notificationId", deleteNotification);
router.get("/unread-count", getUnreadNotificationCount);
router.delete("/clean-up", notificationsCleanup);

export default router;
