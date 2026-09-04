import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";

import {
  createPayment,
  retryPayment,
  stripeWebhook,
} from "../controller/payment.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/create/:orderId", createPayment);

// this routes manage the stripe transactions using card for order
router.post("/webhook", stripeWebhook);

// if payment fails then customer can retry, this endpoint handle this task
router.post("/retry/:orderId", retryPayment);

export default router;
