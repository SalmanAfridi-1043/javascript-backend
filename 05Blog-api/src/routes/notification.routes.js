import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import { getMyNotifications } from "../controllers/notification.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getMyNotifications);

export default router;
