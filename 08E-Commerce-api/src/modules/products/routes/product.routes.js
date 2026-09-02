import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../middleware/multer.middleware.js";

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controller/product.controller.js";

const router = Router();

router.use(authMiddleware);

// array of maximum 5 images are is allowed from form-data/multipart data
router.post("/create", upload.array("images", 5), createProduct);

router.get("/", getAllProducts);

router.get("/:productId", getProductById);

router.patch("/:productId", upload.array("images", 5), updateProduct);

router.delete("/:productId", deleteProduct);

export default router;
