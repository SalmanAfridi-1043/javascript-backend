import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";
import { adminMiddleware } from "../../../middleware/admin.middleware.js";

import {
  confirmCODPayment,
  createPayment,
  getAllPayments,
  getMyPayments,
  getPaymentDetails,
  refundPayment,
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

router.post("/refund/:orderId", adminMiddleware, refundPayment);

// this endpoint shows all the payments details to admin for management. Only admin can read this
router.get("/admin", adminMiddleware, getAllPayments);

router.get("/:orderId", getPaymentDetails);

router.get("/", getMyPayments);

// this end point handles the COD (Cash On Delivery) privider
router.patch("/cod/:orderId/confirm", adminMiddleware, confirmCODPayment);

export default router;
