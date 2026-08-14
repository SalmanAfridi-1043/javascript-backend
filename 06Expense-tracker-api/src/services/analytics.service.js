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

export { getMonthlySummaryService };
