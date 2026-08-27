import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeConversationMiddleware } from "../middleware/authorizeConversation.middleware.js";

import {
  createDirectConversation,
  createGroupConversation,
  getConversation,
  getConversationMessages,
  getUnreadCounts,
  getUserConversations,
} from "../controllers/conversation.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/direct", createDirectConversation);

router.get("/", getUserConversations);

router.get(
  "/:conversationId",
  authorizeConversationMiddleware,
  getConversation,
);

router.post("/group", createGroupConversation);

// the user must be a participant of that conversation to access its messages so adding the authorization middleware
router.get(
  "/:conversationId/messages",
  authorizeConversationMiddleware,
  getConversationMessages,
);

router.get("/unread", getUnreadCounts);

export default router;
