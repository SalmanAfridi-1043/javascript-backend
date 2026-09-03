import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../middleware/multer.middleware.js";

import {
  addToCart,
  clearCart,
  getCart,
  getCartSummary,
  removeCartItem,
  updateCartItem,
  validateCart,
} from "../controller/cart.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", addToCart);

router.get("/", getCart);

router.patch("/:itemId", updateCartItem);

router.delete("/:itemId", removeCartItem);

router.delete("/", clearCart);

router.get("/summary", getCartSummary);

// This task ensures the cart is still valid before creating an order.
router.get("/validate", validateCart);

export default router;
