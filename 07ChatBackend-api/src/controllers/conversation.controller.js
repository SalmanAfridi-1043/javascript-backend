import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
  createDirectConversationService,
  createGroupConversationService,
  getConversationMessagesService,
  getConversationService,
  getUnreadCountsService,
  getUserConversationsService,
} from "../services/conversation.service.js";

const createDirectConversation = asyncHandler(async (req, res) => {
  const currentUserId = req.user?._id;
  const { targetUserId } = req.body;

  const conversation = await createDirectConversationService(
    currentUserId,
    targetUserId,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversation, "Conversation created successfully"),
    );
});

const getUserConversations = asyncHandler(async (req, res) => {
  const currentUserId = req.user?._id;

  const allConversations = await getUserConversationsService(currentUserId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allConversations,
        "Conversation fetched successfully",
      ),
    );
});

const getConversation = asyncHandler(async (req, res) => {
  const currentUserId = req.user?._id;
  const { conversationId } = req.params;

  const conversation = await getConversationService(
    currentUserId,
    conversationId,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversation, "Conversation fetched successfully"),
    );
});

const createGroupConversation = asyncHandler(async (req, res) => {
  const currentUserId = req.user?._id;
  const { name, participants } = req.body;

  const conversation = await createGroupConversationService(
    currentUserId,
    name,
    participants,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversation, "Conversation fetched successfully"),
    );
});

const getConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const paginationData = req.query;

  const allMessages = await getConversationMessagesService(
    conversationId,
    paginationData,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, allMessages, "All messages fetched successfully"),
    );
});

const getUnreadCounts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const response = await getUnreadCountsService(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, response, "All unread counts fetched successfully"),
    );
});

export {
  createDirectConversation,
  getUserConversations,
  getConversation,
  createGroupConversation,
  getConversationMessages,
  getUnreadCounts,
};
