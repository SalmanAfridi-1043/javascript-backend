import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cookieOptions } from "../utils/cookieOptions.js";

import {
  getAverageTransactionAmountService,
  getCategorySpendingService,
  getCategorySpendingYearlyService,
  getHighestSpendingTransactionService,
  getMonthlyBalanceTrendService,
  getMonthlySummaryService,
  getMonthlyTrendsService,
  getPaymentMethodSummaryService,
  getTopSpendingCategoriesService,
  getYearlyTrendsSummaryService,
} from "../services/analytics.service.js";

const getMonthlySummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const userId = req.user._id;

  const monthlySummary = await getMonthlySummaryService(userId, month, year);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        monthlySummary,
        "Monthly summary fetched successfully",
      ),
    );
});

const getCategorySpending = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const userId = req.user._id;

  const monthlySpending = await getCategorySpendingService(userId, month, year);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        monthlySpending,
        "Monthly spending fetched successfully",
      ),
    );
});

// Income vs expense for each month of a given year.
const getMonthlyTrends = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const userId = req.user._id;

  const monthlyTrends = await getMonthlyTrendsService(userId, year);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        monthlyTrends,
        "Monthly trends fetched successfully",
      ),
    );
});

const getCategorySpendingYearly = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const userId = req.user._id;

  const categorySpendingYearly = await getCategorySpendingYearlyService(
    userId,
    year,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        categorySpendingYearly,
        "Category spending yearly fetched successfully",
      ),
    );
});

const getTopSpendingCategories = asyncHandler(async (req, res) => {
  const { year, limit } = req.query;
  const userId = req.user._id;

  const topSpendingCategories = await getTopSpendingCategoriesService(
    userId,
    year,
    limit,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        topSpendingCategories,
        "Top spending categories fetched successfully",
      ),
    );
});

const getPaymentMethodSummary = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const userId = req.user._id;

  const paymentMethodSummary = await getPaymentMethodSummaryService(
    userId,
    year,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        paymentMethodSummary,
        "Payment method summary fetched successfully",
      ),
    );
});

const getYearlyTrendsSummary = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const userId = req.user._id;

  const yearlyTrendsSummary = await getYearlyTrendsSummaryService(userId, year);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        yearlyTrendsSummary,
        "yearly trends summary fetched successfully",
      ),
    );
});

const getMonthlyBalanceTrend = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const userId = req.user._id;

  const monthlyBalanceSummary = await getMonthlyBalanceTrendService(
    userId,
    year,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        monthlyBalanceSummary,
        "Monthly balance summary fetched successfully",
      ),
    );
});

const getAverageTransactionAmount = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const userId = req.user._id;

  const averageTransactionSummary = await getAverageTransactionAmountService(
    userId,
    year,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        averageTransactionSummary,
        "Average transaction summary fetched successfully",
      ),
    );
});

const getHighestSpendingTransaction = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const userId = req.user._id;

  const highestExpense = await getHighestSpendingTransactionService(
    userId,
    year,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        highestExpense,
        "Highest expense summary fetched successfully",
      ),
    );
});

export {
  getMonthlySummary,
  getCategorySpending,
  getMonthlyTrends,
  getCategorySpendingYearly,
  getTopSpendingCategories,
  getPaymentMethodSummary,
  getYearlyTrendsSummary,
  getMonthlyBalanceTrend,
  getAverageTransactionAmount,
  getHighestSpendingTransaction,
};
