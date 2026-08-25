import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  createDirectConversation,
  createGroupConversation,
  getConversation,
  getUserConversations,
} from "../controllers/conversation.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/direct", createDirectConversation);

router.get("/", getUserConversations);

router.get("/:conversationId", getConversation);

router.post("/group", createGroupConversation);

export default router;
