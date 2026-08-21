import Router from "express";
import { upload } from "../middleware/multer.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", upload.single("avatar"), registerUser);

router.post("/login", loginUser);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", authMiddleware, logoutUser);

export default router;
