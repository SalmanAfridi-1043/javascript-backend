import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  getCategorySpending,
  getCategorySpendingYearly,
  getMonthlySummary,
  getMonthlyTrends,
  getPaymentMethodSummary,
  getTopSpendingCategories,
} from "../controllers/analytics.controller.js";

const router = Router();

// protected routes
router.use(authMiddleware);

router.get("/monthly", getMonthlySummary);
router.get("/category-spending", getCategorySpending);
router.get("/monthly-trend", getMonthlyTrends);
router.get("/category-spending-yearly", getCategorySpendingYearly);
router.get("/top-categories", getTopSpendingCategories);
router.get("/payment-method-summary", getPaymentMethodSummary);

export default router;
