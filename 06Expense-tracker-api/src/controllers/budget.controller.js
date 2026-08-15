import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { createBudgetService } from "../services/budget.service.js";

const createBudget = asyncHandler(async (req, res) => {
  const budgetData = req.body;
  const userId = req.user._id;

  const budget = await createBudgetService(userId, budgetData);

  return res
    .status(200)
    .json(new ApiResponse(200, budget, "Budget created successfully"));
});

export { createBudget };
