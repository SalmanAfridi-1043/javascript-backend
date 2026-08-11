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
  updatePost,
} from "../controllers/post.controller.js";

const router = Router();

// public routes
router.get("/:slug", getSinglePost); // its public post watching and dont need authMiddleware
router.get("/", getAllPosts); // all public posts
router.get("/category/:category", getPostsbyCategory); //posts based on category

router.use(authMiddleware);

//static routes

// dynamic routes
router.post("/create", upload.single("coverImage"), createPost);
router.patch("/:slug", upload.single("coverImage"), updatePost);
router.delete("/:slug", deletePost);
router.get("/search", searchPost);
router.patch("/:slug/views", incrementPostViews); // public posts views incrementing
router.post("/:slug/like", likeAPost); // authenticated used can like a post

export default router;
