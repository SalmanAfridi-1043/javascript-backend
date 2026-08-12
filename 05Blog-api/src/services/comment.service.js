// services/comment.service.js

import { ApiError } from "../utils/ApiError.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";

const createCommentOnPostService = async (
  userId,
  slug,
  content,
  parentComment,
) => {
  const normalizedSlug = slug?.trim().toLowerCase();
  const normalizedContent = content?.trim();

  validateRequired(userId, "User id");
  validateRequired(normalizedSlug, "Slug");
  validateRequired(normalizedContent, "Content");

  const post = await Post.findOne({
    status: "published",
    slug: normalizedSlug,
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (parentComment) {
    validateObjectId(parentComment, "Parent comment");

    const parent = await Comment.findOne({
      _id: parentComment,
      post: post._id,
    });

    if (!parent) {
      throw new ApiError(404, "Parent comment not found");
    }
  }

  const comment = await Comment.create({
    content: normalizedContent,
    user: userId,
    post: post._id,
    parentComment: parentComment || null,
  });

  return comment;
};

const getCommentsOnPostService = async (slug) => {
  const normalizedSlug = slug?.trim().toLowerCase();

  validateRequired(normalizedSlug, "Slug");

  const post = await Post.findOne({
    status: "published",
    slug: normalizedSlug,
  });

  if (!post) {
    throw new ApiError(404, "No post found");
  }

  const comments = await Comment.find({
    post: post._id,
  })
    .populate("user", "-password -refreshToken")
    .sort({ createdAt: -1 });

  if (comments.length === 0) {
    throw new ApiError(404, "Comments not found");
  }

  return comments;
};

const deleteCommentService = async (userId, commentId) => {
  validateRequired(userId, "User id");
  validateRequired(commentId, "Comment id");

  validateObjectId(commentId, "Comment");

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    user: userId,
  });

  if (!comment) {
    throw new ApiError(404, "No comment found");
  }

  return { success: true };
};

const updateCommentService = async (userId, commentId, content) => {
  const normalizedContent = content?.trim();

  validateRequired(userId, "User id");
  validateRequired(commentId, "Comment id");
  validateRequired(normalizedContent, "Content");

  validateObjectId(commentId, "Comment");

  const comment = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      user: userId,
    },
    {
      $set: {
        content: normalizedContent,
      },
    },
    {
      new: true,
    },
  );

  if (!comment) {
    throw new ApiError(404, "No comment found");
  }

  return comment;
};

const getParentCommentRepliesService = async (commentId) => {
  validateRequired(commentId, "Comment id");

  validateObjectId(commentId, "Comment");

  const parent = await Comment.findById(commentId);

  if (!parent) {
    throw new ApiError(404, "Parent comment not found");
  }

  const replies = await Comment.find({
    parentComment: commentId,
  })
    .populate("user", "-password -refreshToken")
    .sort({ createdAt: -1 });

  return replies;
};

export {
  createCommentOnPostService,
  getCommentsOnPostService,
  deleteCommentService,
  updateCommentService,
  getParentCommentRepliesService,
};
