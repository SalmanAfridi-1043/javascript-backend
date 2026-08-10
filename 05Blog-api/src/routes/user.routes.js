import Router from "express";
import { upload } from "../middleware/multer.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  followUser,
  getUserByUsername,
  getUserFollowers,
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/profile", getUserProfile);
router.patch("/profile", upload.single("avatar"), updateUserProfile);
router.get("/:username", getUserByUsername);
router.post("/:username/follow", followUser); //follow user based on username
router.delete("/:username/follow", unfollowUser);
router.get("/:username/followers", getUserFollowers);

export default router;
