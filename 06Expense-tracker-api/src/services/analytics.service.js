import { ApiError } from "../utils/ApiError.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Transaction } from "../models/transaction.model.js";
import { Category } from "../models/category.model.js";
import { Budget } from "../models/budget.model.js";

const getMonthlySummaryService = async (userId, month, year) => {
  const normalizedMonth = Number(month);
  const normalizedYear = Number(year);

  validateRequired(userId, "User id");
  validateRequired(normalizedMonth, "Month");
  validateRequired(normalizedYear, "Year");

  // = new Date(year, monthIndex, day) - JavaScript Date constructor.
  const startDate = new Date(normalizedYear, normalizedMonth - 1, 1);
  const endDate = new Date(normalizedYear, normalizedMonth, 1);

  const monthlySummary = await Transaction.aggregate([
    // 1. Filter transactions for this user and requested month
    {
      $match: {
        user: userId,
        date: {
          $gte: startDate, // $gte - greater than or equal
          $lt: endDate, // $lt- less than
        },
      },
    },
    // 2. Group transactions by type and calculate total amount
    {
      $group: {
        _id: "$type", // may income or expense (group by income and expense)
        total: { $sum: "$amount" },
      },
    },
  ]);

  // 3. Find the income and expense groups from aggregation result
  // aggregation returns array so use simple mapping trick
  const income = monthlySummary.find((item) => item._id === "income");
  const expense = monthlySummary.find((item) => item._id === "expense");

  // 4. Use 0 if a group doesn't exist
  const totalIncome = income?.total || 0;
  const totalExpense = expense?.total || 0;

  const balance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    balance,
  };
};

const getCategorySpendingService = async (userId, month, year) => {
  const normalizedMonth = Number(month);
  const normalizedYear = Number(year);

  validateRequired(userId, "User id");
  validateRequired(normalizedMonth, "Month");
  validateRequired(normalizedYear, "Year");

  const startDate = new Date(normalizedYear, normalizedMonth - 1, 1);
  const endDate = new Date(normalizedYear, normalizedMonth, 1);

  // The key pipeline to remember is:
  // $match → $group → $lookup → $unwind → $project → $sort.
  const monthlySpending = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: "expense", //as we are calculating spending not earning
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
    // $lookup is basically MongoDB's way of saying like:
    // "Take this ID and find the matching document in another collection."
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },

    // $lookup returns an array, even when only one category matches.
    // That's why we need $unwind to convert it to object/document.
    {
      $unwind: "$categoryDetails",
    },

    // $project:
    // "What fields should my final result contain?"
    // You can select/create the fields you want.
    {
      $project: {
        _id: 0,
        category: "$categoryDetails.name",
        total: 1,
      },
    },

    // Highest spending categories first
    {
      $sort: {
        total: -1,
      },
    },

    // The key pipeline to remember is:
    // $match → $group → $lookup → $unwind → $project → $sort.
  ]);

  return monthlySpending;
};

export { getMonthlySummaryService, getCategorySpendingService };
