import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";

import { createOrder, getMyOrders, getOrderById } from "../controller/order.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createOrder);

router.get("/", getMyOrders);

router.get("/:orderId", getOrderById);

export default router;
