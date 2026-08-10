import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

import { createPost } from "../controllers/post.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/create", upload.single("coverImage"), createPost);

export default router;
