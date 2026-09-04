import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";

import {
  createPayment,
  stripeWebhook,
} from "../controller/payment.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/create/:orderId", createPayment);

router.post("/webhook", stripeWebhook);

export default router;
