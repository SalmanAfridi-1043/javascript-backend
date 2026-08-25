import Router from "express";
import { upload } from "../middleware/multer.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  getUserById,
  searchUsers,
  updateUserProfile,
} from "../controllers/user.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/:userId", getUserById);

router.get("/", searchUsers);

router.patch("/profile", updateUserProfile);

export default router;
