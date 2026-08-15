import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cookieOptions } from "../utils/cookieOptions.js";

import {
  getCategorySpendingService,
  getCategorySpendingYearlyService,
  getMonthlySummaryService,
  getMonthlyTrendsService,
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

export {
  getMonthlySummary,
  getCategorySpending,
  getMonthlyTrends,
  getCategorySpendingYearly,
};
