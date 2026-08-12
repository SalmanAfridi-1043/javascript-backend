import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

import {
  createPost,
  deletePost,
  getAllPosts,
  getPostsbyCategory,
  getSinglePost,
  incrementPostViews,
  likeAPost,
  searchPost,
  unlikeAPost,
  updatePost,
} from "../controllers/post.controller.js";

const router = Router();

// Public routes
router.get("/", getAllPosts);
router.get("/search", searchPost);
router.get("/category/:category", getPostsbyCategory);
router.get("/:slug", getSinglePost);
router.patch("/:slug/views", incrementPostViews);

// Protected routes
router.use(authMiddleware);

router.post("/create", upload.single("coverImage"), createPost);
router.patch("/:slug", upload.single("coverImage"), updatePost);
router.delete("/:slug", deletePost);

router.post("/:slug/like", likeAPost);
router.delete("/:slug/like", unlikeAPost);

export default router;
