import Router from "express";
import { upload } from "../middleware/multer.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  followUser,
  unfollowUser,
  getUserByUsername,
  getUserFollowers,
  getUserFollowing,
  getUserProfile,
  updateUserProfile,
  getAllPosts,
} from "../controllers/user.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/profile", getUserProfile);
router.patch("/profile", upload.single("avatar"), updateUserProfile);
router.get("/:username", getUserByUsername);
router.post("/:username/follow", followUser); //follow user based on username
router.delete("/:username/follow", unfollowUser);
router.get("/:username/followers", getUserFollowers);
router.get("/:username/following", getUserFollowing);
router.get("/:username/posts", getAllPosts);

export default router;
