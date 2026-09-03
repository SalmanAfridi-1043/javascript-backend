import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware.js";

import { createOrder } from "../controller/order.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createOrder);

export default router;
