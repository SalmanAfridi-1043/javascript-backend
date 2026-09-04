import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";

import {
  cancelOrder,
  createOrder,
  getMyOrders,
  getOrderById,
  requestReturn,
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

// Customer can request a return only for a delivered order.
router.patch("/:orderId/return", requestReturn);

export default router;
