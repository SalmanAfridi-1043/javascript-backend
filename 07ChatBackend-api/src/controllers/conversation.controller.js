import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
  createDirectConversationService,
  getConversationService,
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

export { createDirectConversation, getUserConversations, getConversation };
