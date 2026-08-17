import { ApiError } from "../utils/ApiError.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Category } from "../models/category.model.js";
import { Budget } from "../models/budget.model.js";
import { Transaction } from "../models/transaction.model.js";

import {
  validateBudgetDataInput,
  validateBudgetFilters,
  validateBudgetUpdateData,
} from "../validators/budget.validator.js";

const createBudgetService = async (userId, budgetData) => {
  validateRequired(userId, "User id");

  const { categoryId, amount, month, year } =
    validateBudgetDataInput(budgetData);

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (category.type !== "expense") {
    throw new ApiError(400, "Budget is only allowed for an expense category.");
  }

  const isBudgetExists = await Budget.findOne({
    user: userId,
    category: categoryId,
    month,
    year,
  });

  if (isBudgetExists) {
    throw new ApiError(409, "Budget with these values already exists");
  }

  const budget = await Budget.create({
    user: userId,
    category: categoryId,
    amount,
    month,
    year,
  });

  return budget;
};

const getAllBudgetsService = async (userId, filters) => {
  validateRequired(userId, "User id");

  const { categoryId, month, year } = validateBudgetFilters(filters);

  // creating dynamic object for filters
  const queryObject = {
    user: userId,
  };
  if (categoryId !== undefined) {
    queryObject.category = categoryId;
  }
  if (month !== undefined) {
    queryObject.month = month;
  }
  if (year !== undefined) {
    queryObject.year = year;
  }

  const allBudgets = await Budget.find(queryObject)
    .populate("category")
    .sort({ createdAt: -1 });

  return allBudgets;
};

const getSingleBudgetService = async (userId, budgetId) => {
  validateRequired(userId, "User id ");
  validateRequired(budgetId, "Budget id ");
  validateObjectId(budgetId, "Budget");

  const budget = await Budget.findOne({
    _id: budgetId,
    user: userId,
  }).populate("category");

  if (!budget) {
    throw new ApiError(404, "Budget not found");
  }

  return budget;
};

const updateBudgetService = async (userId, budgetId, data) => {
  const { categoryId, amount, month, year } = validateBudgetUpdateData(data);

  validateRequired(userId, "User id ");
  validateRequired(budgetId, "Budget id ");
  validateObjectId(budgetId, "Budget");

  // if category is changed then it should be of type expense only for budget details
  if (categoryId !== undefined) {
    const category = await Category.findById(categoryId);

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    if (category.type !== "expense") {
      throw new ApiError(400, "Invalid category type");
    }
  }

  const budget = await Budget.findOne({
    _id: budgetId,
    user: userId,
  }).populate("category");

  if (!budget) {
    throw new ApiError(404, "Budget not found");
  }

  // creating new/updated values to check the duplicate budget
  const finalCategoryId = categoryId ?? budget.category;
  const finalMonth = month ?? budget.month;
  const finalYear = year ?? budget.year;

  const isBudgetAlreadyEXists = await Budget.findOne({
    user: userId,
    category: finalCategoryId,
    month: finalMonth,
    year: finalYear,
    _id: { $ne: budgetId },
    // $ne - not equal to operator
    // means - Find documents whose _id is NOT this budgetId.
  });

  if (isBudgetAlreadyEXists) {
    throw new ApiError(409, "Budget already exists");
  }

  if (categoryId !== undefined) {
    budget.category = categoryId;
  }
  if (amount !== undefined) {
    budget.amount = amount;
  }
  if (month !== undefined) {
    budget.month = month;
  }
  if (year !== undefined) {
    budget.year = year;
  }

  await budget.save();

  return budget;
};

const deleteBudgetService = async (userId, budgetId) => {
  validateRequired(userId, "User id ");
  validateRequired(budgetId, "Budget id ");
  validateObjectId(budgetId, "Budget");

  const budget = await Budget.findOneAndDelete({
    _id: budgetId,
    user: userId,
  });

  if (!budget) {
    throw new ApiError(404, "Budget not found");
  }

  return { success: true };
};
const getBudgetVsActualSpendingService = async (
  userId,
  budgetId,
  month,
  year,
) => {
  validateRequired(userId, "User id");
  validateRequired(budgetId, "Budget id");
  validateObjectId(budgetId, "Budget");

  const normalizedMonth = Number(month);
  const normalizedYear = Number(year);

  validateRequired(normalizedMonth, "Month");
  validateRequired(normalizedYear, "Year");

  // 1. Start and end of the requested month
  const startDate = new Date(normalizedYear, normalizedMonth - 1, 1);
  const endDate = new Date(normalizedYear, normalizedMonth, 1);

  const budgetVsActualSummary = await Budget.aggregate([
    // 2. Find the specific budget belonging to this user
    {
      $match: {
        _id: budgetId,
        user: userId,
        month: normalizedMonth,
        year: normalizedYear,
      },
    },

    // 3. Find transactions belonging to this budget's
    //    user + category + month/year
    {
      $lookup: {
        from: "transactions",

        // Values taken from the current Budget document
        let: {
          budgetUser: "$user",
          budgetCategory: "$category",
        },

        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  // Transaction belongs to same user
                  { $eq: ["$user", "$$budgetUser"] },

                  // Transaction belongs to same category
                  { $eq: ["$category", "$$budgetCategory"] },

                  // Only expenses count as spending
                  { $eq: ["$type", "expense"] },

                  // Transaction date is inside the requested month
                  { $gte: ["$date", startDate] },
                  { $lt: ["$date", endDate] },
                ],
              },
            },
          },
        ],

        as: "transactions",
      },
    },

    // 4. Calculate actual spending from matched transactions
    {
      $project: {
        _id: 1,
        category: 1,
        budget: "$amount",

        spent: {
          $sum: "$transactions.amount",
        },
      },
    },

    // 5. Calculate remaining budget
    {
      $project: {
        category: 1,
        budget: 1,
        spent: 1,

        remaining: {
          $subtract: ["$budget", "$spent"],
        },
      },
    },

    // 6. Get category name
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },

    {
      $unwind: "$categoryDetails",
    },

    // 7. Final response shape
    {
      $project: {
        _id: 0, // ignore id
        category: "$categoryDetails.name",
        budget: 1,
        spent: 1,
        remaining: 1,
      },
    },
  ]);

  return budgetVsActualSummary;
};

export {
  createBudgetService,
  getAllBudgetsService,
  getSingleBudgetService,
  updateBudgetService,
  deleteBudgetService,
  getBudgetVsActualSpendingService,
};
