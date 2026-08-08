import Router from "express";
import { upload } from "../middleware/multer.middleware.js";

import {
  loginUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);

router.post("/refresh-token", refreshAccessToken);

export default router;
