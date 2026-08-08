import Router from "express";
import { upload } from "../middleware/multer.middleware.js";

import { registerUser } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", upload.single("avatar"), registerUser);

export default router;
