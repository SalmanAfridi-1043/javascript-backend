import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Conversation } from "../models/conversation.model.js";

const authorizeConversationMiddleware = asyncHandler(async (req, res, next) => {
  const currentUserId = req.user?._id;
  const { conversationId } = req.params;

  validateRequired(currentUserId, "current user id");
  validateRequired(conversationId, "Conversation id");
  validateObjectId(conversationId, "conversation");

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // is current user the participant of that conversation ?
  if (
    !conversation.participants.some(
      (participant) => participant.toString() === currentUserId.toString(),
    )
  ) {
    throw new ApiError(403, "Unauthorized access");
  }

  next();
});

export { authorizeConversationMiddleware };
