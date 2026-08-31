import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../middleware/multer.middleware.js";

import {
  changePassword,
  getUserProfile,
  updateUserProfile,
} from "../controller/user.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/profile", getUserProfile);

router.patch("/profile", upload.single("avatar"), updateUserProfile);

    router.patch("/change-password", changePassword);

export default router;
