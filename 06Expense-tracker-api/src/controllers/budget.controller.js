import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
  createBudgetService,
  deleteBudgetService,
  getAllBudgetsService,
  getBudgetProgressService,
  getBudgetStatusService,
  getBudgetSummaryService,
  getBudgetVsActualSpendingService,
  getSingleBudgetService,
  updateBudgetService,
} from "../services/budget.service.js";

const createBudget = asyncHandler(async (req, res) => {
  const budgetData = req.body;
  const userId = req.user._id;

  const budget = await createBudgetService(userId, budgetData);

  return res
    .status(200)
    .json(new ApiResponse(200, budget, "Budget created successfully"));
});

const getAllBudgets = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const filters = req.query;

  const allBudgets = await getAllBudgetsService(userId, filters);

  return res
    .status(200)
    .json(new ApiResponse(200, allBudgets, "All budgets fetched successfully"));
});

const getSingleBudget = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { budgetId } = req.params;

  const budget = await getSingleBudgetService(userId, budgetId);

  return res
    .status(200)
    .json(new ApiResponse(200, budget, "Budget fetched successfully"));
});

const updateBudget = asyncHandler(async (req, res) => {
  const data = req.body;
  const userId = req.user._id;
  const { budgetId } = req.params;

  const updatedBudget = await updateBudgetService(userId, budgetId, data);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBudget, "Budget updated successfully"));
});

const deleteBudget = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { budgetId } = req.params;

  const response = await deleteBudgetService(userId, budgetId);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Budget deleted successfully"));
});

const getBudgetVsActualSpending = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { budgetId } = req.params;
  const { month, year } = req.query;

  const budgetVsActualSummary = await getBudgetVsActualSpendingService(
    userId,
    budgetId,
    month,
    year,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        budgetVsActualSummary,
        "Budget vs actual details fetched successfully",
      ),
    );
});

const getBudgetProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { budgetId } = req.params;
  const { month, year } = req.query;

  const budgetProgress = await getBudgetProgressService(userId, month, year);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        budgetProgress,
        "Budget progress fetched successfully",
      ),
    );
});

const getBudgetStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { month, year } = req.query;

  const budgetStatus = await getBudgetStatusService(userId, month, year);

  return res
    .status(200)
    .json(
      new ApiResponse(200, budgetStatus, "Budget status fetched successfully"),
    );
});

const getBudgetSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { month, year } = req.query;

  const budgetSummary = await getBudgetSummaryService(userId, month, year);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        budgetSummary,
        "Budget summary fetched successfully",
      ),
    );
});

export {
  createBudget,
  getAllBudgets,
  getSingleBudget,
  updateBudget,
  deleteBudget,
  getBudgetVsActualSpending,
  getBudgetProgress,
  getBudgetStatus,
  getBudgetSummary,
};
