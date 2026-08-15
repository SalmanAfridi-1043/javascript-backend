import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  getCategorySpending,
  getCategorySpendingYearly,
  getMonthlySummary,
  getMonthlyTrends,
} from "../controllers/analytics.controller.js";

const router = Router();

// protected routes
router.use(authMiddleware);

router.get("/monthly", getMonthlySummary);
router.get("/category-spending", getCategorySpending);
router.get("/monthly-trend", getMonthlyTrends);
router.get("/category-spending-yearly", getCategorySpendingYearly);

export default router;
