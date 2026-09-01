import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../middleware/multer.middleware.js";

import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../controller/category.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/create", upload.single("category"), createCategory);

router.get("/", getAllCategories);

router.get("/:categoryId", getCategoryById);

router.patch("/:categoryId", updateCategory);

router.delete("/:categoryId", deleteCategory);

export default router;
