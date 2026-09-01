import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../middleware/multer.middleware.js";

import {
  createCategory,
  getAllCategories,
} from "../controller/category.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/create", upload.single("category"), createCategory);

router.get("/", getAllCategories);

export default router;
