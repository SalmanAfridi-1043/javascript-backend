import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  deleteNotification,
  getMyNotifications,
  markAllNotificationAsRead,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getMyNotifications);
router.patch("/:notificationId/read", markNotificationAsRead);
router.patch("/read-all", markAllNotificationAsRead);
router.delete("/:notificationId", deleteNotification);

export default router;
