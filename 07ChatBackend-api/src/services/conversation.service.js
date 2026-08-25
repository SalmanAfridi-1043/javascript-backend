import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { createSafeUser } from "../utils/sanitizeUser.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Conversation } from "../models/conversation.model.js";
import { validateParticipantIds } from "../validators/conversation.validator.js";

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

  const conversations = await Conversation.find({
    participants: currentUserId,
  })
    .populate("participants")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  return conversations;
};

const getConversationService = async (currentUserId, conversationId) => {
  validateRequired(currentUserId, "User id");
  validateRequired(conversationId, "Conversation id");
  validateObjectId(conversationId, "Conversation");

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: currentUserId,
  })
    .populate("participants")
    .populate("lastMessage");

  return conversation;
};

const createGroupConversationService = async (
  currentUserId,
  name,
  participants,
) => {
  validateRequired(currentUserId, "Current user");

  if (!name.trim() || typeof name !== "string") {
    throw new ApiError(400, "Group name is required");
  }

  //check its type and if not empty
  if (!Array.isArray(participants) || participants.length === 0) {
    throw new ApiError(400, "Participants are required");
  }

  // adding the current user so that it ll create the group(an admin)
  const allParticipantIds = [currentUserId, ...participants];

  // remove duplicate user ids if exists
  const uniqueParticipantIds = [...new Set(allParticipantIds.map(String))];

  validateParticipantIds(uniqueParticipantIds, "Participant IDs");

  // check if all the participant ids are valid and all its users exists
  // this will return all valid and existing users (may be less that actuall if not invalid ids)
  const users = await User.find({
    _id: { $in: uniqueParticipantIds },
    // $in means: Find documents whose _id is one of these values.
  });

  // ensure all the participants are valid and equal
  // users - filtered users || uniqueParticipantIds-all users without checked
  if (users.length !== uniqueParticipantIds.length) {
    throw new ApiError(404, "One or more participants were not found");
  }

  if (uniqueParticipantIds.length < 2) {
    throw new ApiError(400, "A group must have at least 2 participants");
  }

  const conversation = await Conversation.create({
    type: "group",
    name: name.trim(),
    participants: uniqueParticipantIds,
    admin: currentUserId,
  });

  return conversation;
};

export {
  createDirectConversationService,
  getUserConversationsService,
  getConversationService,
  createGroupConversationService,
};
