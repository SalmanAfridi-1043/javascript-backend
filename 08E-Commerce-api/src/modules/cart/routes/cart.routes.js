import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { upload } from "../../../middleware/multer.middleware.js";

import {
  addToCart,
  clearCart,
  getCart,
  getCartSummary,
  removeCartItem,
  syncCart,
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

// Now handle cases where products/variants became inactive or unavailable after they were added to the cart (Sync/Remove Invalid Cart Items).
router.patch("/sync", syncCart);

export default router;
