import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Transaction } from "../models/transaction.model.js";
import { validateTransactionData } from "../validators/transaction.validator.js";
import { Category } from "../models/category.model.js";

const createTransactionService = async (userId, data) => {
  validateRequired(userId, "User id");
  const {
    type,
    amount,
    description,
    categoryId,
    paymentMethod,
    date,
    notes,
    recurring,
    frequency,
  } = validateTransactionData(data);

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (category.type !== type) {
    throw new ApiError(400, "Category type does not match transaction type");
  }

  const transaction = await Transaction.create({
    user: userId,
    type,
    amount,
    description,
    category: categoryId,
    paymentMethod,
    date,
    notes: notes || null,
    recurring,
    frequency: frequency || null,
  });

  return transaction;
};

const getAllTransactionsService = async (userId) => {
  validateRequired(userId, "User id");

  const allTransactions = await Transaction.find({
    user: userId,
  })
    .populate("category")
    .sort({ createdAt: -1 });

  return allTransactions;
};

export { createTransactionService, getAllTransactionsService };
