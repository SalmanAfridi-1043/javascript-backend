import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { createRecurringTransactionService } from "../services/recurring.service.js";

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

export { createRecurringTransaction };
