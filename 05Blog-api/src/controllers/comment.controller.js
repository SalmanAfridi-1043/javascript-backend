// controllers/comment.controller.js

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
  createCommentOnPostService,
  deleteCommentService,
  getCommentsOnPostService,
  getParentCommentRepliesService,
  updateCommentService,
} from "../services/comment.service.js";

const createCommentOnPost = asyncHandler(async (req, res, next) => {
  const { content, parentComment } = req.body;
  const { slug } = req.params;
  const userId = req.user?._id;

  const createdComment = await createCommentOnPostService(
    userId,
    slug,
    content,
    parentComment,
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdComment,
        "Comment added on post successfully",
      ),
    );
});

const getCommentsOnPost = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const comments = await getCommentsOnPostService(slug);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "All comments fetched successfully"));
});

const deleteComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  const response = await deleteCommentService(userId, commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Comment deleted successfully"));
});

const updateComment = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const { commentId } = req.params;
  const userId = req.user?._id;

  const updatedComment = await updateCommentService(userId, commentId, content);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const getParentCommentReplies = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  const replies = await getParentCommentRepliesService(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, replies, "All replies fetched successfully"));
});

export {
  createCommentOnPost,
  getCommentsOnPost,
  deleteComment,
  updateComment,
  getParentCommentReplies,
};
