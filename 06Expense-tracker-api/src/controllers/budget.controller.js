import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
  createBudgetService,
  getAllBudgetsService,
  getSingleBudgetService,
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

export { createBudget, getAllBudgets, getSingleBudget };
