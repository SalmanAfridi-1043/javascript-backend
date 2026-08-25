import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import { createDirectConversation } from "../controllers/conversation.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/direct", createDirectConversation);

export default router;
