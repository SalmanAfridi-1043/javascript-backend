import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
  createRecurringTransactionService,
  deleteRecurringTransactionService,
  generateNextRecurringTransactionService,
  getAllRecurringTransactionsService,
  getNextOccurrenceService,
  getSingleRecurringTransactionService,
  toggleRecurringTransactionService,
  updateRecurringTransactionService,
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

const getSingleRecurringTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { transactionId } = req.params;

  const recurringTransaction = await getSingleRecurringTransactionService(
    userId,
    transactionId,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        recurringTransaction,
        "Transaction recurring fetched successfully",
      ),
    );
});

const updateRecurringTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { transactionId } = req.params;
  const updateData = req.body;

  const updatedRecurring = await updateRecurringTransactionService(
    userId,
    transactionId,
    updateData,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedRecurring,
        "Recurring transaction updated successfully",
      ),
    );
});

const deleteRecurringTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { transactionId } = req.params;

  const response = await deleteRecurringTransactionService(
    userId,
    transactionId,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        response,
        "Recurring transaction deleted successfully",
      ),
    );
});

const toggleRecurringTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { transactionId } = req.params;

  const updatedRecurringTransaction = await toggleRecurringTransactionService(
    userId,
    transactionId,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedRecurringTransaction,
        "Recurring transaction toggled successfully",
      ),
    );
});

const getNextOccurrence = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { transactionId } = req.params;

  const nextOccurrenceDetails = await getNextOccurrenceService(
    userId,
    transactionId,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        nextOccurrenceDetails,
        "Next transaction occurrnce details fetched successfully",
      ),
    );
});

const generateNextRecurringTransaction = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { transactionId } = req.params;

  const nextTransaction = await generateNextRecurringTransactionService(
    userId,
    transactionId,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        nextTransaction,
        "Next occurrence transaction generated successfully",
      ),
    );
});

export {
  createRecurringTransaction,
  getAllRecurringTransactions,
  getSingleRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringTransaction,
  getNextOccurrence,
  generateNextRecurringTransaction,
};
