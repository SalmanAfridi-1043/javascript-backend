import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../middleware/multer.middleware.js";

import { createProduct, getAllProducts } from "../controller/product.controller.js";

const router = Router();

router.use(authMiddleware);

// array of maximum 5 images are is allowed from form-data/multipart data
router.post("/create", upload.array("images", 5), createProduct);

router.get("/", getAllProducts);

export default router;
