import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../middleware/multer.middleware.js";

import {
  createProduct,
  createProductVariant,
  deleteProduct,
  deleteProductVariant,
  getAllProducts,
  getProductById,
  getProductVariantById,
  getProductVariants,
  updateProduct,
  updateProductStatus,
  updateProductVariant,
} from "../controller/product.controller.js";

const router = Router();

router.use(authMiddleware);

// array of maximum 5 images are is allowed from form-data/multipart data
router.post("/create", upload.array("images", 5), createProduct);

router.get("/", getAllProducts);

router.get("/:productId", getProductById);

router.patch("/:productId", upload.array("images", 5), updateProduct);

router.delete("/:productId", deleteProduct);

router.patch("/:productId/status", updateProductStatus);

router.post("/:productId/variants", createProductVariant);

router.get("/:productId/variants", getProductVariants);

router.get("/:productId/variants/:variantId", getProductVariantById);

router.patch("/:productId/variants/:variantId", updateProductVariant);

router.delete("/:productId/variants/:variantId", deleteProductVariant);

export default router;
