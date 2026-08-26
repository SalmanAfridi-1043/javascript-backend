import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";
import { ApiError } from "../utils/ApiError.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { validateRequired } from "../utils/validateRequired.js";

const sendMessageService = async ({ conversationId, content, senderId }) => {
  // 1. Validate input
  // 2. Find conversation
  // 3. Check sender is a participant
  // 4. Create message
  // 5. Update conversation.lastMessage
  // 6. Return created message

  const normalizedContent = content?.trim();

  validateRequired(conversationId, "Conversation id");
  validateObjectId(conversationId, "conversation");
  validateRequired(senderId, "sender id");
  validateObjectId(senderId, "sender");
  validateRequired(normalizedContent, "content");

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: senderId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content: normalizedContent,
  });

  conversation.lastMessage = message;

  await conversation.save();

  return message;
};

export { sendMessageService };
