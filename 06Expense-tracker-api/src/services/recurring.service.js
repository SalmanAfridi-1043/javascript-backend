import { ApiError } from "../utils/ApiError.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Category } from "../models/category.model.js";
import { Transaction } from "../models/transaction.model.js";

import {
  validateRecurringData,
  validateRecurringFilters,
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

export {
  createRecurringTransactionService,
  getAllRecurringTransactionsService,
};
