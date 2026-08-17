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

const getBudgetProgressService = async (userId, month, year) => {
  validateRequired(userId, "User id");

  const normalizedMonth = Number(month);
  const normalizedYear = Number(year);

  validateRequired(normalizedMonth, "Month");
  validateRequired(normalizedYear, "Year");

  const startDate = new Date(normalizedYear, normalizedMonth - 1, 1);
  const endDate = new Date(normalizedYear, normalizedMonth, 1);

  const budgetProgressSummary = await Budget.aggregate([
    // 1. Get all budgets of this user for the requested month/year
    {
      $match: {
        user: userId,
        month: normalizedMonth,
        year: normalizedYear,
      },
    },

    // 2. Find expense transactions belonging to each budget
    {
      $lookup: {
        from: "transactions",

        // Values from the current Budget document
        let: {
          budgetUser: "$user",
          budgetCategory: "$category",
        },

        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  // Same user
                  { $eq: ["$user", "$$budgetUser"] },

                  // Same category
                  { $eq: ["$category", "$$budgetCategory"] },

                  // Only expenses
                  { $eq: ["$type", "expense"] },

                  // Transaction belongs to requested month
                  { $gte: ["$date", startDate] },
                  { $lt: ["$date", endDate] },
                ],
              },
            },
          },
        ],

        as: "transactionDetails",
      },
    },

    // 3. Calculate actual spending
    {
      $project: {
        category: 1,
        budget: "$amount",

        spent: {
          $sum: "$transactionDetails.amount",
        },
      },
    },

    // 4. Calculate remaining amount and percentage used
    {
      $project: {
        category: 1,
        budget: 1,
        spent: 1,

        remaining: {
          $subtract: ["$budget", "$spent"],
        },

        percentageUsed: {
          $multiply: [{ $divide: ["$spent", "$budget"] }, 100],
        },
      },
    },

    // 5. Get category details
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },

    // 6. Convert category array into object
    {
      $unwind: "$categoryDetails",
    },

    // 7. Final response
    {
      $project: {
        _id: 0,
        category: "$categoryDetails.name",
        budget: 1,
        spent: 1,
        remaining: 1,
        percentageUsed: 1,
      },
    },
  ]);

  return budgetProgressSummary;
};

const getBudgetStatusService = async (userId, month, year) => {
  validateRequired(userId, "User id");

  const normalizedMonth = Number(month);
  const normalizedYear = Number(year);

  validateRequired(normalizedMonth, "Month");
  validateRequired(normalizedYear, "Year");

  const startDate = new Date(normalizedYear, normalizedMonth - 1, 1);
  const endDate = new Date(normalizedYear, normalizedMonth, 1);

  const budgetStatus = await Budget.aggregate([
    {
      $match: {
        user: userId,
        month: normalizedMonth,
        year: normalizedYear,
      },
    },

    {
      $lookup: {
        from: "transactions",

        let: {
          budgetUser: "$user",
          budgetCategory: "$category",
        },

        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$user", "$$budgetUser"] },
                  { $eq: ["$category", "$$budgetCategory"] },
                  { $eq: ["$type", "expense"] },
                  { $gte: ["$date", startDate] },
                  { $lt: ["$date", endDate] },
                ],
              },
            },
          },
        ],
      },
      as: "transactionDetails",
    },

    {
      $project: {
        category: 1,
        budget: "$amount",
        spent: { $sum: "$transactionDetails.amount" },
      },
    },

    {
      $project: {
        category: 1,
        budget: 1,
        spent: 1,

        remaining: {
          $subtract: ["$budget", "$spent"],
        },

        percentageUsed: {
          $multiply: [{ $divide: ["$spent", "$budget"] }, 100],
        },
      },
    },

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

    {
      $project: {
        category: "$categoryDetails.name",
        budget: 1,
        spent: 1,
        percentageUsed: 1,

        status: {
          $switch: {
            branches: [
              {
                case: {
                  $lte: ["$percentageUsed", 80],
                },
                then: "under_budget",
              },

              {
                case: {
                  $lte: ["$percentageUsed", 100],
                },
                then: "near_limit",
              },
            ],

            default: "over_budget",
          },
        },
      },
    },
  ]);

  return budgetStatus;
};

const getBudgetSummaryService = async (userId, month, year) => {
  validateRequired(userId, "User id");

  const normalizedMonth = Number(month);
  const normalizedYear = Number(year);

  validateRequired(normalizedMonth, "Month");
  validateRequired(normalizedYear, "Year");

  const startDate = new Date(normalizedYear, normalizedMonth - 1, 1);
  const endDate = new Date(normalizedYear, normalizedMonth, 1);

  const budgetSummary = await Budget.aggregate([
    {
      $match: {
        user: userId,
        month: normalizedMonth,
        year: normalizedYear,
      },
    },

    {
      $lookup: {
        from: "transactions",

        let: {
          budgetUser: "$user",
          budgetCategory: "$category",
        },

        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$user", "$budgetUser"] },
                  { $eq: ["$category", "$budgetCategory"] },
                  { $eq: ["$type", "expense"] },
                  { $gte: ["$date", startDate] },
                  { $lt: ["$date", endDate] },
                ],
              },
            },
          },
        ],
        as: "transactionDetails",
      },
    },

    {
      $project: {
        budget: "$amount",
        spent: { $sum: "$transactionDetails.amount" },
      },
    },

    {
      $group: {
        // _id: null means:Put everything into one single group.
        _id: null,
        totalBudget: { $sum: "$budget" },
        totalSpent: { $sum: "$spent" },
      },
    },

    // returning the final values
    {
      $project: {
        totalBudget: 1,
        totalSpent: 1,

        totalRemaining: {
          $subtract: ["$totalBudget", "$totalSpent"],
        },

        percentageUsed: {
          $multiply: [{ $divide: ["$totalSpent", "$totalBudget"] }, 100],
        },
      },
    },
  ]);

  if (budgetSummary.length === 0) {
    return {
      totalBudget: 0,
      totalSpent: 0,
      totalRemaining: 0,
      percentageUsed: 0,
    };
  }

  return budgetSummary[0];
};

const getBudgetComparisonService = async (userId, month, year) => {
  validateRequired(userId, "User id");

  const normalizedMonth = Number(month);
  const normalizedYear = Number(year);

  validateRequired(normalizedMonth, "Month");
  validateRequired(normalizedYear, "Year");

  // Current month date range
  const currentStart = new Date(normalizedYear, normalizedMonth - 1, 1);
  const currentEnd = new Date(normalizedYear, normalizedMonth, 1);

  // Previous month date range
  const previousStart = new Date(normalizedYear, normalizedMonth - 2, 1);
  const previousEnd = currentStart;

  /*
    We also need the previous month's budget month/year.

    JavaScript Date automatically handles January:
    month = 1
    month - 2 = -1
    → December of previous year
  */
  const previousDate = new Date(normalizedYear, normalizedMonth - 2, 1);
  const previousMonth = previousDate.getMonth() + 1;
  const previousYear = previousDate.getFullYear();

  const budgetComparison = await Budget.aggregate([
    // =========================================================
    // 1. Create two separate results:
    //    currentMonth + previousMonth
    // =========================================================
    {
      $facet: {
        // =====================================================
        // CURRENT MONTH
        // =====================================================
        currentMonth: [
          {
            $match: {
              user: userId,
              month: normalizedMonth,
              year: normalizedYear,
            },
          },

          // Find transactions belonging to each budget
          {
            $lookup: {
              from: "transactions",

              let: {
                budgetUser: "$user",
                budgetCategory: "$category",
              },

              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$user", "$$budgetUser"],
                        },
                        {
                          $eq: ["$category", "$$budgetCategory"],
                        },
                        {
                          $eq: ["$type", "expense"],
                        },
                        {
                          $gte: ["$date", currentStart],
                        },
                        {
                          $lt: ["$date", currentEnd],
                        },
                      ],
                    },
                  },
                },
              ],

              as: "currentTransactionDetails",
            },
          },

          // Calculate current spending
          {
            $project: {
              category: 1,
              currentBudget: "$amount",
              currentSpend: {
                $sum: "$currentTransactionDetails.amount",
              },
            },
          },
        ],

        // =====================================================
        // PREVIOUS MONTH
        // =====================================================
        previousMonth: [
          {
            $match: {
              user: userId,
              month: previousMonth,
              year: previousYear,
            },
          },

          // Find previous month's transactions
          {
            $lookup: {
              from: "transactions",

              let: {
                budgetUser: "$user",
                budgetCategory: "$category",
              },

              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$user", "$$budgetUser"],
                        },
                        {
                          $eq: ["$category", "$$budgetCategory"],
                        },
                        {
                          $eq: ["$type", "expense"],
                        },
                        {
                          $gte: ["$date", previousStart],
                        },
                        {
                          $lt: ["$date", previousEnd],
                        },
                      ],
                    },
                  },
                },
              ],

              as: "previousTransactionDetails",
            },
          },

          // Calculate previous spending
          {
            $project: {
              category: 1,
              previousBudget: "$amount",
              previousSpend: {
                $sum: "$previousTransactionDetails.amount",
              },
            },
          },
        ],
      },
    },

    // =========================================================
    // 2. Combine currentMonth with previousMonth
    // =========================================================
    {
      $project: {
        comparison: {
          $map: {
            input: "$currentMonth",
            as: "current",

            in: {
              category: "$$current.category",

              currentBudget: "$$current.currentBudget",
              currentSpend: "$$current.currentSpend",

              /*
                Find the previous month's document
                having the SAME category.
              */
              previous: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$previousMonth",
                      as: "previous",

                      cond: {
                        $eq: ["$$previous.category", "$$current.category"],
                      },
                    },
                  },

                  // Take first matching category
                  0,
                ],
              },
            },
          },
        },
      },
    },

    // =========================================================
    // 3. Flatten the previous object and calculate change
    // =========================================================
    {
      $unwind: {
        path: "$comparison",
      },
    },

    {
      $project: {
        _id: 0,

        category: "$comparison.category",

        currentBudget: "$comparison.currentBudget",
        currentSpend: "$comparison.currentSpend",

        previousBudget: "$comparison.previous.previousBudget",
        previousSpend: "$comparison.previous.previousSpend",

        spendingChange: {
          $cond: [
            {
              $gt: ["$comparison.previous.previousSpend", 0],
            },

            {
              $multiply: [
                {
                  $divide: [
                    {
                      $subtract: [
                        "$comparison.currentSpend",
                        "$comparison.previous.previousSpend",
                      ],
                    },

                    "$comparison.previous.previousSpend",
                  ],
                },

                100,
              ],
            },

            0,
          ],
        },
      },
    },

    // =========================================================
    // 4. Get category name
    // =========================================================
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

    // =========================================================
    // 5. Final response
    // =========================================================
    {
      $project: {
        category: "$categoryDetails.name",

        currentBudget: 1,
        currentSpend: 1,

        previousBudget: 1,
        previousSpend: 1,

        spendingChange: 1,
      },
    },
  ]);

  return budgetComparison;
};

const getBudgetAlertsService = async (userId, month, year) => {
  validateRequired(userId, "User id");

  const normalizedMonth = Number(month);
  const normalizedYear = Number(year);

  validateRequired(normalizedMonth, "Month");
  validateRequired(normalizedYear, "Year");

  const startDate = new Date(normalizedYear, normalizedMonth - 1, 1);
  const endDate = new Date(normalizedYear, normalizedMonth, 1);

  const budgetAlerts = await Budget.aggregate([
    // 1. Get budgets for the requested month/year
    {
      $match: {
        user: userId,
        month: normalizedMonth,
        year: normalizedYear,
      },
    },

    // 2. Find expense transactions for each budget
    {
      $lookup: {
        from: "transactions",

        let: {
          budgetUser: "$user",
          budgetCategory: "$category",
        },

        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  // Same user
                  { $eq: ["$user", "$$budgetUser"] },

                  // Same category
                  { $eq: ["$category", "$$budgetCategory"] },

                  // Only expenses
                  { $eq: ["$type", "expense"] },

                  // Requested month
                  { $gte: ["$date", startDate] },
                  { $lt: ["$date", endDate] },
                ],
              },
            },
          },
        ],

        as: "transactionDetails",
      },
    },

    // 3. Calculate actual spending
    {
      $project: {
        category: 1,
        budget: "$amount",

        spent: {
          $sum: "$transactionDetails.amount",
        },
      },
    },

    // 4. Calculate percentage used
    {
      $project: {
        category: 1,
        budget: 1,
        spent: 1,

        percentageUsed: {
          $multiply: [
            {
              $divide: ["$spent", "$budget"],
            },
            100,
          ],
        },
      },
    },

    // 5. Determine alert/status
    {
      $project: {
        category: 1,
        budget: 1,
        spent: 1,
        percentageUsed: 1,

        status: {
          $switch: {
            branches: [
              {
                // Less than 75%
                case: {
                  $lt: ["$percentageUsed", 75],
                },
                then: "under_budget",
              },

              {
                // 75% - 100%
                case: {
                  $lte: ["$percentageUsed", 100],
                },
                then: "near_limit",
              },
            ],

            // More than 100%
            default: "over_budget",
          },
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

    // 7. Convert category array to object
    {
      $unwind: "$categoryDetails",
    },

    // 8. Final response
    {
      $project: {
        _id: 0,
        category: "$categoryDetails.name",
        budget: 1,
        spent: 1,
        percentageUsed: 1,
        status: 1,
      },
    },

    // 9. Show most critical budgets first
    {
      $sort: {
        percentageUsed: -1,
      },
    },
  ]);

  return budgetAlerts;
};

export {
  createBudgetService,
  getAllBudgetsService,
  getSingleBudgetService,
  updateBudgetService,
  deleteBudgetService,
  getBudgetVsActualSpendingService,
  getBudgetProgressService,
  getBudgetStatusService,
  getBudgetSummaryService,
  getBudgetComparisonService,
  getBudgetAlertsService,
};
