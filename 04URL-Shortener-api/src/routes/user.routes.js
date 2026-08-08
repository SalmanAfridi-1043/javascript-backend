import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "../controllers/user.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", authMiddleware, logoutUser);

export default router;
