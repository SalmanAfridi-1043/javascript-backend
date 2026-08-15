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

const getMonthlyTrendsService = async (userId, year) => {
  const normalizedYear = Number(year);

  validateRequired(userId, "User id");
  validateRequired(normalizedYear, "Year");

  const startDate = new Date(normalizedYear, 0, 1);
  const endDate = new Date(normalizedYear + 1, 0, 1);

  // const monthlyTrends = await Transaction.aggregate([
  //   {
  //     $match: {
  //       user: userId,
  //       date: {
  //         $gte: startDate,
  //         $lt: endDate,
  //       },
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: {
  //         // $month extracts the month number from your Date field
  //         month: { $month: "$date" },
  //         type: "$type",
  //       },
  //       total: { $sum: "$amount" },
  //     },
  //   },

  //   {
  //     // January → December (ascending order).
  //     $sort: {
  //       "$_id.month": 1, // as month is inside the id (grouped by category)
  //     },
  //   },
  // ]);

  // End result of above aggregation will look like this
  // [
  //   {
  //     _id: { month: 1, type: "income" },
  //     total: 5000
  //   },
  //   {
  //     _id: { month: 1, type: "expense" },
  //     total: 2000
  //   }
  // ]

  // but we need output result like this.
  // [
  //   { month: 1, income: 5000, expense: 2000 },
  //   { month: 2, income: 7000, expense: 3000 },
  // ];

  // sor formating the result
  // const formattedTrends = monthlyTrends.reduce((result, item) => {
  //   const month = item._id.month;
  //   const type = item._id.type;

  //   let monthData = result.find((item) => item.month === month);

  //   if (!monthData) {
  //     monthData = {
  //       month,
  //       income: 0,
  //       expense: 0,
  //     };

  //     result.push(monthData);
  //   }

  //   monthData[type] = item.total;

  //   return result;
  // }, []);

  const monthlyTrends = await Transaction.aggregate([
    // 1. getting user transaction for the required year
    {
      $match: {
        user: userId,
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    // grouped by month+type and calculate sum of each type
    {
      $group: {
        _id: {
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },

    // group again by month only to find monthly income and expense in one object
    {
      $group: {
        _id: "$_id.month",

        income: {
          $sum: {
            $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0],
          },
        },

        expense: {
          $sum: {
            $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0],
          },
        },
      },
    },

    // selecting only required fields
    {
      $project: {
        _id: 0,
        month: "$_id",
        income: 1,
        expense: 1,
      },
    },
    // sorting by january - december
    {
      $sort: {
        month: 1,
      },
    },
  ]);

  return {
    year,
    monthlyTrends,
  };
};

const getCategorySpendingYearlyService = async (userId, year) => {
  const normalizedYear = Number(year);

  validateRequired(userId, "User id");
  validateRequired(normalizedYear, "Year");

  const startDate = new Date(normalizedYear, 0, 1);
  const endDate = new Date(normalizedYear + 1, 0, 1);

  const categorySpendingYearly = await Transaction.aggregate([
    // finding the user transactions for expense only with required year
    {
      $match: {
        user: userId,
        type: "expense",
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },

    // group the user transactions on category to get monthly income + expense details
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },

    // now fetching the actual category document based on the _id of group result
    {
      $lookup: {
        from: "categories",
        localField: "_id", // result of group has _id for category._id (in transaction)
        foreignField: "_id", //actuall db ids for category document
        as: "categoryDetails",
      },
    },

    // lookup returns array so coverting to object/document
    {
      $unwind: "$categoryDetails",
    },

    // selecting only the required fields and ignoring the unwanted fields
    {
      $project: {
        category: "$categoryDetails.name",
        total: 1,
      },
    },

    // sorting by highest - lowest spending
    {
      $sort: {
        total: -1,
      },
    },
  ]);

  return categorySpendingYearly;
};

const getTopSpendingCategoriesService = async (userId, year, limit) => {
  const normalizedYear = Number(year);
  const normalizedLimit = Number(limit) || 5;

  validateRequired(userId, "User id");
  validateRequired(normalizedYear, "Year");
  validateRequired(normalizedLimit, "Limit");

  // = new Date(year, monthIndex , day)
  const startDate = new Date(normalizedYear, 0, 1);
  const endDate = new Date(normalizedYear + 1, 0, 1);

  const topSpendingCategories = await Transaction.aggregate([
    // match the transaction for user with expense only for required date
    {
      $match: {
        user: userId,
        type: "expense",
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },

    // group the user transactions based on categories and find some of each
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },

    // get category document instead of only category id
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },

    // convert the lookup-result/array to object
    {
      $unwind: "$categoryDetails",
    },

    // select only required fields
    {
      $project: {
        category: "$categoryDetails.name",
        total: 1,
      },
    },

    // sort by highest - lowest
    {
      $sort: {
        total: -1,
      },
    },

    // select the first categories user needed like (top 3 or 5)
    {
      $limit: normalizedLimit, // return only limited/mentioned/top categories user needed
    },
  ]);

  return topSpendingCategories;
};

const getPaymentMethodSummaryService = async (userId, year) => {
  const normalizedYear = Number(year);

  validateRequired(userId, "User id");
  validateRequired(normalizedYear, "Year");

  const startDate = new Date(normalizedYear, 0, 1);
  const endDate = new Date(normalizedYear + 1, 0, 1);

  const paymentmethodSummary = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },

    {
      $group: {
        _id: "$paymentMethod",

        income: {
          $sum: {
            // here using type directly coz its transaction document field
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
          },
        },

        expense: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
          },
        },
      },
    },

    {
      $project: {
        paymentMethod: "$_id",
        income: 1,
        expense: 1,
      },
    },

    {
      $sort: {
        paymentMethod: 1,
      },
    },
  ]);

  return paymentmethodSummary;
};

const getYearlyTrendsSummaryService = async (userId, year) => {
  const normalizedYear = Number(year);

  validateRequired(userId, "User id");
  validateRequired(normalizedYear, "Year");

  const startDate = new Date(normalizedYear, 0, 1);
  const endDate = new Date(normalizedYear + 1, 0, 1);

  const yearlyTrendsSummary = await Transaction.aggregate([
    // filtering the user transactions only for required date
    {
      $match: {
        user: userId,
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },

    // no grouping needed coz calculating all yearly income and expense as a group
    {
      $group: {
        _id: null,

        income: {
          // yearly income sum using transaction type
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
          },
        },

        expense: {
          // yearly expense sum using transaction type
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
          },
        },
      },
    },

    // balance can't be calculated in group/above stage coz its just calculate there but having not its actual value for whole year. only the result of group will have yearly value. so calculating after the group return values/result
    {
      $project: {
        _id: 0,
        income: 1,
        expense: 1,

        // normal arthimatic is not allowed in mongoDB. u ve to used operators like sum etc
        balance: {
          $subtract: ["$income", "$expense"],
        },
      },
    },
  ]);

  return yearlyTrendsSummary;
};

export {
  getMonthlySummaryService,
  getCategorySpendingService,
  getMonthlyTrendsService,
  getCategorySpendingYearlyService,
  getTopSpendingCategoriesService,
  getPaymentMethodSummaryService,
  getYearlyTrendsSummaryService,
};
