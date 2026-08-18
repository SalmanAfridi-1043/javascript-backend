import { ApiError } from "../utils/ApiError.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Category } from "../models/category.model.js";
import { Transaction } from "../models/transaction.model.js";

import {
  validateRecurringData,
  validateRecurringFilters,
  validateRecurringUpdateData,
  calculateNextOccurrence,
} from "../validators/recurring.validator.js";

const createRecurringTransactionService = async (userId, data) => {
  validateRequired(userId, "User id");

  const {
    type,
    amount,
    description,
    categoryId,
    paymentMethod,
    date,
    recurring,
    frequency,
    notes,
  } = validateRecurringData(data);

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  if (category.type !== type) {
    throw new ApiError(400, "Invalid transaction type");
  }

  const transaction = await Transaction.create({
    user: userId,
    type,
    amount,
    description,
    category: categoryId,
    paymentMethod,
    date,
    notes,
    recurring,
    frequency,
  });

  // create doesnot support populate.. coz when transaction creates then category can be populated
  await transaction.populate("category");

  return transaction;
};

const getAllRecurringTransactionsService = async (userId, recurringFilters) => {
  validateRequired(userId, "User id");

  const { type, frequency } = validateRecurringFilters(recurringFilters);

  const filterObject = {
    user: userId,
    recurring: true,
  };
  if (type !== undefined) {
    filterObject.type = type;
  }
  if (frequency !== undefined) {
    filterObject.frequency = frequency;
  }

  const allRecurrings = await Transaction.find(filterObject)
    .populate("category")
    .sort({ createdAt: -1 });

  if (allRecurrings.length === 0) {
    throw new ApiError(404, "No recurring transactions found");
  }

  return allRecurrings;
};

const getSingleRecurringTransactionService = async (userId, transactionId) => {
  validateRequired(userId, "User id");
  validateRequired(transactionId, "Transaction id");
  validateObjectId(transactionId, "Transaction");

  const recurringTransaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
    recurring: true,
  }).populate("category");

  if (!recurringTransaction) {
    throw new ApiError(404, "Recurring transaction not found");
  }

  return recurringTransaction;
};

const updateRecurringTransactionService = async (
  userId,
  transactionId,
  updateData,
) => {
  validateRequired(userId, "User id");
  validateRequired(transactionId, "Transaction id");
  validateObjectId(transactionId, "Transaction");

  const {
    amount,
    description,
    categoryId,
    paymentMethod,
    date,
    frequency,
    notes,
  } = validateRecurringUpdateData(updateData);

  const recurringTransaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
    recurring: true,
  });

  if (!recurringTransaction) {
    throw new ApiError(404, "Recurring Transaction not found");
  }

  // if wana change category, then transaction and category type must be  same
  if (categoryId !== undefined) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }
    if (category.type !== recurringTransaction.type) {
      throw new ApiError(400, "Invalid type");
    }
  }

  // updating only given data.
  if (amount !== undefined) {
    recurringTransaction.amount = amount;
  }
  if (description !== undefined) {
    recurringTransaction.description = description;
  }
  if (categoryId !== undefined) {
    recurringTransaction.category = categoryId;
  }
  if (paymentMethod !== undefined) {
    recurringTransaction.paymentMethod = paymentMethod;
  }
  if (date !== undefined) {
    recurringTransaction.date = date;
  }
  if (frequency !== undefined) {
    recurringTransaction.frequency = frequency;
  }
  if (notes !== undefined) {
    recurringTransaction.notes = notes;
  }

  await recurringTransaction.save();
  await recurringTransaction.populate("category");

  return recurringTransaction;
};

const deleteRecurringTransactionService = async (userId, transactionId) => {
  validateRequired(userId, "User id");
  validateRequired(transactionId, "Transaction id");
  validateObjectId(transactionId, "Transaction");

  const recurringTransaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    user: userId,
    recurring: true,
  });

  if (!recurringTransaction) {
    throw new ApiError(404, "Recurring Transaction not found");
  }

  return { success: true };
};

const toggleRecurringTransactionService = async (userId, transactionId) => {
  validateRequired(userId, "User id");
  validateRequired(transactionId, "Transaction id");
  validateObjectId(transactionId, "Transaction");

  const recurringTransaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
  });

  if (!recurringTransaction) {
    throw new ApiError(404, "Transaction not found");
  }

  // get current recurring state and then toggle it
  const toggledState = !recurringTransaction.recurring;
  recurringTransaction.recurring = toggledState;
  await recurringTransaction.save();

  return recurringTransaction;
};

const getNextOccurrenceService = async (userId, transactionId) => {
  validateRequired(userId, "User id");
  validateRequired(transactionId, "Transaction id");
  validateObjectId(transactionId, "Transaction");

  const recurringTransaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
    recurring: true,
  });

  if (!recurringTransaction) {
    throw new ApiError(404, "Transaction not found");
  }

  const date = recurringTransaction.date;
  const frequency = recurringTransaction.frequency;

  const nextDate = calculateNextOccurrence(date, frequency);

  return nextDate;
};

const generateNextRecurringTransactionService = async (
  userId,
  transactionId,
) => {
  validateRequired(userId, "User id");
  validateRequired(transactionId, "Transaction id");
  validateObjectId(transactionId, "Transaction");

  const recurringTransaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
    recurring: true,
  });
  if (!recurringTransaction) {
    throw new ApiError(404, "Transaction not found");
  }

  const date = recurringTransaction.date;
  const frequency = recurringTransaction.frequency;

  const nextDate = calculateNextOccurrence(date, frequency);

  const nextOccuringTransaction = await Transaction.create({
    user: userId,
    type: recurringTransaction.type,
    category: recurringTransaction.category,
    amount: recurringTransaction.amount,
    description: recurringTransaction.description,
    paymentMethod: recurringTransaction.paymentMethod,
    date: nextDate,
    notes: recurringTransaction.notes,
    recurring: true,
    frequency: recurringTransaction.frequency,
  });

  return nextOccuringTransaction;
};

export {
  createRecurringTransactionService,
  getAllRecurringTransactionsService,
  getSingleRecurringTransactionService,
  updateRecurringTransactionService,
  deleteRecurringTransactionService,
  toggleRecurringTransactionService,
  getNextOccurrenceService,
  generateNextRecurringTransactionService,
};
