import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";

import { createPayment } from "../controller/payment.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/create/:orderId", createPayment);

export default router;
