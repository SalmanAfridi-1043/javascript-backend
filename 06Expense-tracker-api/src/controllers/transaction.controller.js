import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cookieOptions } from "../utils/cookieOptions.js";

import { createTransactionService } from "../services/transaction.service.js";

const createTransaction = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const data = req.body;

  const transaction = await createTransactionService(userId, data);

  return res
    .status(200)
    .json(
      new ApiResponse(200, transaction, "Transaction created successfully"),
    );
});

export { createTransaction };
