import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";

import {
    cancelOrder,
  createOrder,
  getMyOrders,
  getOrderById,
} from "../controller/order.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createOrder);

router.get("/", getMyOrders);

router.get("/:orderId", getOrderById);

router.patch("/:orderId/cancel", cancelOrder);

export default router;
