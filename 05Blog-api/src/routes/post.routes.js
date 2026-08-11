import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

import {
  createPost,
  deletePost,
  getAllPosts,
  getSinglePost,
  updatePost,
} from "../controllers/post.controller.js";

const router = Router();

// public routes
router.get("/:slug", getSinglePost); // its public post watching and dont need authMiddleware
router.get("/", getAllPosts); // all public posts

router.use(authMiddleware);

//static routes

// dynamic routes
router.post("/create", upload.single("coverImage"), createPost);
router.patch("/:slug", upload.single("coverImage"), updatePost);
router.delete("/:slug", deletePost);

export default router;
