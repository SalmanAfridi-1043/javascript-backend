import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { createSafeUser } from "../utils/sanitizeUser.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Conversation } from "../models/conversation.model.js";

const createDirectConversationService = async (currentUserId, targetUserId) => {
  validateRequired(currentUserId, "Current user id");
  validateRequired(targetUserId, "Target user id");
  validateObjectId(currentUserId, "Current user");
  validateObjectId(targetUserId, "Target user");

  if (currentUserId.toString() === targetUserId.toString()) {
    throw new ApiError(400, "You cannot create a conversation with yourself");
  }

  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const existingDirectConversation = await Conversation.findOne({
    type: "direct",
    participants: {
      $all: [currentUserId, targetUserId],
    },
  });

  if (existingDirectConversation) {
    return existingDirectConversation;
  }

  const directConversation = await Conversation.create({
    type: "direct",
    participants: [currentUserId, targetUserId],
  });

  return directConversation;
};

const getUserConversationsService = async (currentUserId) => {
  validateRequired(currentUserId, "User id");

  const conversation = await Conversation.find({
    participants: currentUserId,
  })
    .populate("participants")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  return conversation;
};

export { createDirectConversationService, getUserConversationsService };
