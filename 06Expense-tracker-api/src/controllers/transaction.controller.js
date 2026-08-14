import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cookieOptions } from "../utils/cookieOptions.js";

import {
  createTransactionService,
  deleteTransactionService,
  getAllTransactionsService,
  getSingleTransactionService,
  updateTransactionService,
} from "../services/transaction.service.js";

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

const getAllTransactions = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const parameters = req.query;

  const allTransactions = await getAllTransactionsService(
    userId,
    parameters,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allTransactions,
        "All transactions fetched successfully",
      ),
    );
});

const getSingleTransaction = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const { transactionId } = req.params;

  const transaction = await getSingleTransactionService(userId, transactionId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, transaction, "Transaction fetched successfully"),
    );
});

const updateTransaction = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const { transactionId } = req.params;
  const data = req.body;

  const updatedTransaction = await updateTransactionService(
    userId,
    transactionId,
    data,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedTransaction,
        "Transaction updated successfully",
      ),
    );
});

const deleteTransaction = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const { transactionId } = req.params;

  const response = await deleteTransactionService(userId, transactionId);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Transaction deleted successfully"));
});

export {
  createTransaction,
  getAllTransactions,
  getSingleTransaction,
  updateTransaction,
  deleteTransaction,
};
