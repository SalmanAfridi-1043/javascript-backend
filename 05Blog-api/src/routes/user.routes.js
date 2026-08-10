import Router from "express";
import { upload } from "../middleware/multer.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/profile", getUserProfile);
router.patch("/profile", upload.single("avatar"), updateUserProfile);

export default router;
