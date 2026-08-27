import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { createSafeUser } from "../utils/sanitizeUser.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import {
  validateParticipantIds,
  validatePaginationData,
} from "../validators/conversation.validator.js";

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
    participants: currentUserId, // this is done by the authorization middleware.
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

const getConversationMessagesService = async (
  conversationId,
  paginationData,
) => {
  validateRequired(conversationId, "Conversation id");
  validateObjectId(conversationId, "conversation");

  const { page, limit } = validatePaginationData(paginationData);
  const skip = (page - 1) * limit;

  // as the authorization middleware has confirmed that conversation exists and the user is authorizaed so no need to find conversation and check if exists

  const allMessages = await Message.find({
    conversation: conversationId,
  })
    .populate("sender")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Message.countDocuments({
    conversation: conversation._id,
  });

  const pages = Math.ceil(total / limit);
  const previousPage = page > 1;
  const nextPage = page < pages;

  return {
    allMessages,
    total,
    pages,
    limit,
    previousPage,
    nextPage,
  };
};

const getUnreadCountsService = async (userId) => {
  validateRequired(userId, "User id");

  const allConversations = await Conversation.find({
    participants: userId,
  });

  const conversationIds = allConversations.map(
    (conversation) => conversation._id,
  );

  const unreadCounts = await Message.aggregate([
    {
      // match the readCount also the current user will not be in sender/readBy
      $match: {
        conversation: { $in: conversationIds },
        sender: { $ne: userId },
        readBy: { $ne: userId },
      },
    },

    {
      $group: {
        _id: "$conversation",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalUnread = unreadCounts.reduce(
    (total, conversation) => total + conversation.count,
    0,
  );
  return { unreadCounts, totalUnread };
};

const addGroupMemberService = async (adminId, conversationId, memberId) => {
  validateRequired(adminId, "User id");
  validateRequired(conversationId, "conversation id");
  validateRequired(memberId, "member id");

  validateObjectId(adminId, "User");
  validateObjectId(conversationId, "Conversation");
  validateObjectId(memberId, "Member");

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  if (conversation.admin.toString() !== adminId.toString()) {
    throw new ApiError(
      403,
      "Unauthorized access! Only admin can manage conversation",
    );
  }

  if (conversation.type !== "group") {
    throw new ApiError(400, "Invalid conversation type");
  }

  const isParticipant = conversation.participants.some(
    (participant) => participant.toString() === memberId.toString(),
  );

  if (isParticipant) {
    throw new ApiError(409, "Member alread added to conversation");
  }

  const member = await User.findById(memberId);
  if (!member) {
    throw new ApiError(404, "Participant not found");
  }

  const updatedConversation = await Conversation.findByIdAndUpdate(
    conversationId,
    {
      $addToSet: { participants: memberId },
    },
    {
      new: true,
    },
  );

  return updatedConversation;
};

const removeGroupMemberService = async (adminId, conversationId, memberId) => {
  validateRequired(adminId, "User id");
  validateRequired(conversationId, "conversation id");
  validateRequired(memberId, "member id");

  validateObjectId(adminId, "User");
  validateObjectId(conversationId, "Conversation");
  validateObjectId(memberId, "Member");

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  if (conversation.type !== "group") {
    throw new ApiError(400, "Invalid conversation type");
  }

  if (conversation.admin.toString() !== adminId.toString()) {
    throw new ApiError(
      403,
      "Unauthorized access! Only admin can manage conversation",
    );
  }

  const isParticipant = conversation.participants.some(
    (participant) => participant.toString() === memberId.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(409, "Member alread removed from conversation");
  }

  // Prevent admin from removing themselves
  if (conversation.admin.toString() === memberId.toString()) {
    throw new ApiError(409, "Admin cannot remove themselves from conversation");
  }

  conversation.participants.pull(memberId);
  await conversation.save();

  return conversation;
};

const leaveGroupConversationService = async (userId, conversationId) => {
  validateRequired(userId, "User id");
  validateRequired(conversationId, "conversation id");

  validateObjectId(userId, "User");
  validateObjectId(conversationId, "Conversation");

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  if (conversation.type !== "group") {
    throw new ApiError(400, "Invalid conversation type");
  }

  const isParticipant = conversation.participants.some(
    (participant) => participant.toString() === userId.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(409, "User already removed from conversation");
  }

  // If user is admin: --→ prevent leaving and  transfer admin first
  if (conversation.admin.toString() === userId.toString()) {
    throw new ApiError(409, "User require to transfer admin rights first");
  }

  conversation.participants.pull(userId);
  await conversation.save();

  return { success: true };
};

const transferGroupAdminService = async (
  currentAdminId,
  conversationId,
  newAdminId,
) => {
  validateRequired(currentAdminId, "current Admin Id ");
  validateRequired(conversationId, "conversation id");
  validateRequired(newAdminId, "new admin id");

  validateObjectId(currentAdminId, "Current Admin");
  validateObjectId(conversationId, "Conversation");
  validateObjectId(newAdminId, "New admin");

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  if (conversation.type !== "group") {
    throw new ApiError(400, "Invalid conversation type");
  }

  // Verify current user is the admin
  if (conversation.admin.toString() !== currentAdminId.toString()) {
    throw new ApiError(409, "User is not admin of conversation");
  }

  const isParticipant = conversation.participants.some(
    (participant) => participant.toString() === newAdminId.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(409, "User is not participant of conversation");
  }

  if (conversation.admin.toString() === newAdminId.toString()) {
    throw new ApiError(409, "Existing admin cannot transfer to new admin");
  }

  conversation.admin = newAdminId;
  await conversation.save();

  return conversation;
};

export {
  createDirectConversationService,
  getUserConversationsService,
  getConversationService,
  createGroupConversationService,
  getConversationMessagesService,
  getUnreadCountsService,
  addGroupMemberService,
  removeGroupMemberService,
  leaveGroupConversationService,
  transferGroupAdminService,
};
