import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  getMyNotifications,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getMyNotifications);
router.patch("/:notificationId/read", markNotificationAsRead);

export default router;
