import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../middleware/multer.middleware.js";

import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controller/cart.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", addToCart);

router.get("/", getCart);

router.patch("/:itemId", updateCartItem);

router.delete("/:itemId", removeCartItem);

export default router;
