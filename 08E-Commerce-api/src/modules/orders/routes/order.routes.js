import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";

import {
  cancelOrder,
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controller/order.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createOrder);

router.get("/", getMyOrders);

router.get("/:orderId", getOrderById);

router.patch("/:orderId/cancel", cancelOrder);

// Now we introduce admin-only order management - (Update Order Status (Admin))
router.patch("/:orderId/status", updateOrderStatus);

export default router;
