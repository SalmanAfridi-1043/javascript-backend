import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
  createRecurringTransactionService,
  getAllRecurringTransactionsService,
} from "../services/recurring.service.js";

const createRecurringTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const data = req.body;

  const createdRecurring = await createRecurringTransactionService(
    userId,
    data,
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdRecurring, "Recurring created successfully"),
    );
});

const getAllRecurringTransactions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const recurringFilters = req.query;

  const allRecurrings = await getAllRecurringTransactionsService(
    userId,
    recurringFilters,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, allRecurrings, "All recurring fetched successfully"),
    );
});

export { createRecurringTransaction, getAllRecurringTransactions };
