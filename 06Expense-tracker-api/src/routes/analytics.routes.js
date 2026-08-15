import Router from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  getAverageTransactionAmount,
  getCategorySpending,
  getCategorySpendingYearly,
  getHighestSpendingTransaction,
  getMonthlyBalanceTrend,
  getMonthlySummary,
  getMonthlyTrends,
  getPaymentMethodSummary,
  getSpendingByPaymentMethod,
  getSpendingByWeekday,
  getTopSpendingCategories,
  getYearlyTrendsSummary,
} from "../controllers/analytics.controller.js";

const router = Router();

// protected routes
router.use(authMiddleware);

router.get("/monthly", getMonthlySummary);
router.get("/category-spending", getCategorySpending);

// incomve vs expense per month for whole year
router.get("/monthly-trend", getMonthlyTrends);
router.get("/category-spending-yearly", getCategorySpendingYearly);
router.get("/top-categories", getTopSpendingCategories);
router.get("/payment-method-summary", getPaymentMethodSummary);
router.get("/yearly-trend", getYearlyTrendsSummary);

// income,expense and balance for each month of an year (Monthly Income vs Expense Comparison)
router.get("/monthly-balance-trend", getMonthlyBalanceTrend);

// average income and average expense transaction amount for a given year.
router.get("/average-transaction", getAverageTransactionAmount);
router.get("/highest-expense", getHighestSpendingTransaction);

// Find how much the user spends on each day of the week during a given year.
router.get("/weekday-spending", getSpendingByWeekday);

// Calculating the total expense for each payment method for a given year.
router.get("/payment-method-spending", getSpendingByPaymentMethod);

export default router;
