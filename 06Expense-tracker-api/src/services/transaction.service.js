import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Transaction } from "../models/transaction.model.js";
import {
  validateTransactionData,
  validateTransactionUpdateData,
  validateFilterParams,
} from "../validators/transaction.validator.js";
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

const getAllTransactionsService = async (userId, parameters) => {
  const {
    type,
    categoryId,
    paymentMethod,
    from,
    to,
    search,
    sortBy,
    page,
    limit,
  } = validateFilterParams(parameters);

  validateRequired(userId, "User id");

  // dynamic query for filtering
  const query = {
    user: userId,
  };
  if (type !== undefined) query.type = type;
  if (categoryId !== undefined) query.category = categoryId;
  if (paymentMethod !== undefined) query.paymentMethod = paymentMethod;
  if (from || to) {
    query.date = {};
    if (from) {
      query.date.$gte = new Date(from);
    }
    if (to) {
      query.date.$lte = new Date(to);
    }
  }
  // $gte = greater than or equal to → >=
  // $lte = less than or equal to → <=
  // $gt = greater than → >
  // $lt = less than → <

  // date: {
  //   $gte: from,
  //   $lte: to
  // }
  // means: Find transactions where date is between from and to, including both dates.

  // to search for transaction using search parameter
  if (search) {
    query.$or = [
      { notes: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // dynamic sorting object
  const sortObject = {};
  if (sortBy === "date") {
    sortObject.date = 1;
  } else if (sortBy === "-date") {
    sortObject.date = -1;
  } else if (sortBy === "amount") {
    sortObject.amount = 1;
  } else if (sortBy === "-amount") {
    sortObject.amount = -1;
  } else {
    sortObject.createdAt = -1;
  }

  // alternate of above
  // const sortObject = {
  //   date: sortBy === "date" ? 1 : sortBy === "-date" ? -1 : undefined,
  //   amount: sortBy === "amount" ? 1 : sortBy === "-amount" ? -1 : undefined,
  // };

  // calculate skip
  const skip = (page - 1) * limit;

  const allTransactions = await Transaction.find(query)
    .populate("category")
    .skip(skip)
    .limit(limit)
    .sort(sortObject);

  const totalTransactions = await Transaction.countDocuments(query);
  const totalPages = Math.ceil(totalTransactions / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  // it returns [] if the its empty
  return {
    allTransactions,
    total: totalTransactions,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
};

const getSingleTransactionService = async (userId, transactionId) => {
  validateRequired(userId, "User id");
  validateRequired(transactionId, "Transaction id");

  validateObjectId(transactionId, "Transaction");

  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: userId, // ownership
  })
    .populate("user", "-password -refreshToken")
    .populate("category");

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return transaction;
};

const updateTransactionService = async (userId, transactionId, data) => {
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
  } = validateTransactionUpdateData(data);

  validateRequired(userId, "User id");
  validateRequired(transactionId, "Transaction id");

  validateObjectId(transactionId, "Transaction");

  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: userId, // ownership
  });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  // If the category changes but type isn't provided, you need to compare the category against the existing transaction type.
  // If the type changes, you need to compare against the new type.
  // os food amout must goes to expense not income.
  // finalType = newType or oldType
  const finalType = type ?? transaction.type;

  // validating the category type and transaction type
  if (categoryId !== undefined || type !== undefined) {
    validateObjectId(categoryId, "Category");

    const category = await Category.findById(categoryId);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    if (finalType !== category.type) {
      throw new ApiError(400, "Category type does not match transaction type");
    }
  }

  // Apply changes to transaction document data
  if (type !== undefined) {
    transaction.type = type;
  }

  if (amount !== undefined) {
    transaction.amount = amount;
  }

  if (description !== undefined) {
    transaction.description = description;
  }

  if (categoryId !== undefined) {
    transaction.category = categoryId;
  }

  if (paymentMethod !== undefined) {
    transaction.paymentMethod = paymentMethod;
  }

  if (date !== undefined) {
    transaction.date = date;
  }

  if (notes !== undefined) {
    transaction.notes = notes;
  }

  if (recurring !== undefined) {
    transaction.recurring = recurring;
    if (recurring === false) {
      transaction.frequency = undefined;
    } else if (frequency !== undefined) {
      transaction.frequency = frequency;
    }
  } else if (frequency !== undefined) {
    transaction.frequency = frequency;
  }

  await transaction.save();

  return transaction;
};

const deleteTransactionService = async (userId, transactionId) => {
  validateRequired(userId, "User id");
  validateRequired(transactionId, "Transaction id");

  validateObjectId(transactionId, "Transaction");

  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    user: userId, // ownership
  });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return { success: true };
};

export {
  createTransactionService,
  getAllTransactionsService,
  getSingleTransactionService,
  updateTransactionService,
  deleteTransactionService,
};
