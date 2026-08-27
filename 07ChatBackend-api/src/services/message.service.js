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

const markMessageDeliveredService = async ({ messageId, receiverId }) => {
  // 1. Validate messageId
  // 2. Find message
  // 3. Check user is allowed to receive/access this message
  // 4. Add userId to deliveredTo
  // 5. Avoid duplicate userId
  // 6. Return updated message

  validateRequired(receiverId, "User id");
  validateRequired(messageId, "Message id");

  validateObjectId(receiverId, "User");
  validateObjectId(messageId, "message");

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  const conversation = await Conversation.findById(message.conversation);

  if (!conversation) {
    throw new ApiError(404, "conversation not found");
  }

  // map() return new array but we need to check only so some is good and it just help in traversing only
  const isParticipant = conversation.participants.some(
    (participant) => participant.toString() === receiverId.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(403, "Unauthorized access to conversation");
  }

  const updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    {
      // $addToset: just add the userid to set and remove the duplicate
      $addToSet: { deliveredTo: receiverId },
    },
    { new: true },
  );

  return updatedMessage;
};

const markMessageReadService = async ({ messageId, readerId }) => {
  validateRequired(readerId, "User id");
  validateRequired(messageId, "Message id");

  validateObjectId(readerId, "User");
  validateObjectId(messageId, "message");

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  const conversation = await Conversation.findById(message.conversation);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isParticipant = conversation.participants.some(
    (participant) => participant.toString() === readerId.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(403, "Unauthorized access to conversation");
  }

  const updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    {
      $addToSet: { readBy: readerId },
    },
    { new: true },
  );

  return updaate;
};

const editMessageService = async ({ messageId, content, senderId }) => {
  const normalizedContent = content.trim();

  validateRequired(senderId, "User id");
  validateRequired(messageId, "Message id");
  validateRequired(normalizedContent, "Content");

  validateObjectId(senderId, "User");
  validateObjectId(messageId, "message");

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  const conversation = await Conversation.findById(message.conversation);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isSender = message.sender.toString() === senderId.toString();

  if (!isSender) {
    throw new ApiError(403, "You can only edit your own messages");
  }

  const editedAt = new Date();

  const updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    {
      $set: {
        content: normalizedContent,
        editedAt,
      },
    },
    {
      new: true,
    },
  );

  return updatedMessage;
};

const deleteMessageService = async ({ messageId, conversationId, userId }) => {
  validateRequired(userId, "User id");
  validateRequired(messageId, "Message id");
  validateRequired(conversationId, "Conversation id");

  validateObjectId(userId, "User");
  validateObjectId(messageId, "message");
  validateObjectId(conversationId, "conversation");

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "conversation not found");
  }

  if (message.conversation.toString() !== conversationId.toString()) {
    throw new ApiError(403, "Unauthorized access to conversation");
  }

  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized access to message");
  }

  const deletedAt = new Date();

  // For this project, we'll use soft deletion rather than permanently removing the MongoDB document.
  const deletedMessage = await Message.findByIdAndUpdate(
    messageId,
    {
      $set: {
        deletedAt,
        content: null,
      },
    },
    {
      new: true,
    },
  );

  return deletedMessage;

  // Why soft delete?
  // Because the message may already be referenced by:
  // - conversation history
  // - delivery receipts
  // - read receipts
  // - other users' clients

  // And it lets us represent:
  // "This message was deleted" (like in whatsapp but still its in DB)
  // rather than making the message completely disappear.
};

export {
  sendMessageService,
  markMessageDeliveredService,
  markMessageReadService,
  editMessageService,
  deleteMessageService,
};
