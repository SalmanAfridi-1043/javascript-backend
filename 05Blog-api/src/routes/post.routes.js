import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

import { createPost, getSinglePost } from "../controllers/post.controller.js";

const router = Router();

router.get("/:slug", getSinglePost); // its public post watching and dont need authMiddleware

router.use(authMiddleware);

router.post("/create", upload.single("coverImage"), createPost);

export default router;
