import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  createCommentOnPost,
  deleteComment,
  getCommentsOnPost,
  getParentCommentReplies,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

// Public routes
router.get("/post/:slug", getCommentsOnPost);
router.get("/:commentId/replies", getParentCommentReplies);

// Protected routes
router.use(authMiddleware);

router.post("/post/:slug", createCommentOnPost);
router.patch("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);

export default router;
