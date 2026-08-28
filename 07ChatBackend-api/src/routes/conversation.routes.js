import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeConversationMiddleware } from "../middleware/authorizeConversation.middleware.js";

import {
  addGroupMember,
  createDirectConversation,
  createGroupConversation,
  getConversation,
  getConversationMessages,
  getUnreadCounts,
  getUserConversations,
  leaveGroupConversation,
  removeGroupMember,
  renameGroup,
  transferGroupAdmin,
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

// when admin want to add a member
router.post(
  "/:conversationId/members",
  authorizeConversationMiddleware,
  addGroupMember,
);

// when admin want to remove a member
router.delete(
  "/:conversationId/members/:memberId",
  authorizeConversationMiddleware,
  removeGroupMember,
);

// when a member want to leave the conversation
router.delete(
  "/:conversationId/leave",
  authorizeConversationMiddleware,
  leaveGroupConversation,
);

// when admin want to leave the conversation
router.patch(
  "/:conversationId/admin",
  authorizeConversationMiddleware,
  transferGroupAdmin,
);

router.patch("/:conversationId", authorizeConversationMiddleware, renameGroup);

export default router;
