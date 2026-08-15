import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import { getCategorySpending, getMonthlySummary } from "../controllers/analytics.controller.js";

const router = Router();

// protected routes
router.use(authMiddleware);

router.get("/monthly", getMonthlySummary);
router.get("/category-spending", getCategorySpending);

export default router;
