import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import { getMonthlySummary } from "../controllers/analytics.controller.js";

const router = Router();

// protected routes
router.use(authMiddleware);

router.get("/monthly", getMonthlySummary);

export default router;
