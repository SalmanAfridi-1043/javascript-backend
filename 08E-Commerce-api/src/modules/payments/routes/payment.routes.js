import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";

import {
  createPayment,
  retryPayment,
  stripeWebhook,
} from "../controller/payment.controller.js";

const router = Router();

router.use(authMiddleware);

// this endpoint manages the payment creating for online processing using stripe transactions
router.post("/create/:orderId", createPayment);

// this routes manage the online stripe transactions using card detail (like exp,cvc etc)for order to pay
router.post("/webhook", stripeWebhook);

// if payment fails then customer can retry, this endpoint handle this task
router.post("/retry/:orderId", retryPayment);

export default router;
