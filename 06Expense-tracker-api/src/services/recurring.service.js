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

  // original transaction (we ll use it to create its recurring/child transaction)
  // it should be same in DB. so strickly no change is allowed here
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

  // transaction generated from original one for recurrence/repeatitions
  // this will generate each time (repeatedly) when user wana repeat a specific transctions with its frequency (daily,monthl,weekly or yearly)
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
    recurringTransactionId: recurringTransaction._id,
  });

  // all the generated transactions will have its source/origin using the original transaction refrence (recurringTransactionId: recurringTransaction._id,)
  //it helps to keep track of its parent/original transaction

  return nextOccuringTransaction;
};

const getRecurringTransactionHistoryService = async (userId, transactionId) => {
  validateRequired(userId, "User id");
  validateRequired(transactionId, "Transaction id");
  validateObjectId(transactionId, "Transaction");

  // find the parent/original transactoins first , then use it as a refrence
  const originalTransaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
    recurring: true,
  });

  if (!originalTransaction) {
    throw new ApiError(404, "Transaction not found");
  }

  // get all generated/child transactions from the original/parent
  const generatedTransactions = await Transaction.find({
    user: userId,
    recurring: true,
    recurringTransactionId: originalTransaction._id,
  })
    .populate("user", "-password -refreshToken")
    .populate("category")
    .sort({ date: -1 });

  if (generatedTransactions.length === 0) {
    throw new ApiError(404, "No recurring transactions found");
  }

  return generatedTransactions;
};

const processRecurringTransactionsService = async () => {
  // 1. Get all active recurring transactions
  const allRecurringTransactions = await Transaction.find({
    recurring: true,
  });

  const generatedTransactions = [];

  // 2. Process each recurring transaction
  for (const transaction of allRecurringTransactions) {
    // 3. Calculate when the next occurrence should happen
    const nextDate = calculateNextOccurrence(
      transaction.date,
      transaction.frequency,
    );

    // 4. Get today's date and normalize it to 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 5. Normalize next occurrence to 00:00:00
    // This allows us to compare calendar dates instead of exact times.
    const nextDateOnly = new Date(nextDate);
    nextDateOnly.setHours(0, 0, 0, 0);

    // 6. If the next occurrence is in the future,
    // it is not due yet → skip it.
    if (nextDateOnly > today) {
      continue;
    }

    // 7. Check whether this exact occurrence
    // has already been generated.
    const existingTransaction = await Transaction.findOne({
      recurringTransactionId: transaction._id,
      date: nextDate,
    });

    // 8. Already generated → prevent duplicate transaction
    if (existingTransaction) {
      continue;
    }

    // 9. Generate the next transaction
    const nextTransaction = await Transaction.create({
      user: transaction.user,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      paymentMethod: transaction.paymentMethod,
      date: nextDate,
      notes: transaction.notes,
      recurring: true,
      frequency: transaction.frequency,

      // Keep reference to the original/parent transaction
      recurringTransactionId: transaction._id,
    });

    // 10. Move the parent transaction's date forward
    // so the next scheduler run calculates the next occurrence.
    transaction.date = nextDate;
    await transaction.save();

    // 11. Keep track of transactions generated in this run
    generatedTransactions.push(nextTransaction);
  }

  // 12. Return all transactions generated by this scheduler run
  return generatedTransactions;
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
  getRecurringTransactionHistoryService,
  processRecurringTransactionsService,
};
