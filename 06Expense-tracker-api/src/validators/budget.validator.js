import { ApiError } from "../utils/ApiError";
import { validateObjectId } from "../utils/validateObjectId.js";
import { validateRequired } from "../utils/validateRequired.js";

const validateBudgetDataInput = (budgetData) => {
  const { categoryId, amount, month, year } = budgetData;

  const normalizedAmount = Number(amount);
  const normalizedMonth = Number(month);
  const normalizedYear = Number(year);

  validateRequired(categoryId, "Category id");
  validateObjectId(categoryId, "Category");

  if (
    !normalizedAmount ||
    !Number.isFinite(normalizedAmount) ||
    normalizedAmount <= 0
  ) {
    throw new ApiError(400, "Enter a valid positive finite amount value");
  }

  if (
    !Number.isInteger(normalizedMonth) ||
    normalizedMonth < 1 ||
    normalizedMonth > 12
  ) {
    throw new ApiError(400, "Month must be between 1 and 12");
  }

  if (!Number.isInteger(normalizedYear) || normalizedYear < 2000) {
    throw new ApiError(400, "Invalid year");
  }

  return {
    categoryId,
    amount: normalizedAmount,
    month: normalizedMonth,
    year: normalizedYear,
  };
};

const validateBudgetFilters = (filters) => {
  const { categoryId, month, year } = filters;

  const normalizedMonth = Number(month);
  const normalizedYear = Number(year);

  if (categoryId !== undefined) {
    validateObjectId(categoryId, "Category");
  }

  if (normalizedMonth !== undefined) {
    if (
      !Number.isInteger(normalizedMonth) ||
      normalizedMonth < 1 ||
      normalizedMonth > 12
    ) {
      throw new ApiError(400, "Month must be between 1 and 12");
    }
  }

  if (normalizedYear !== undefined) {
    if (!Number.isInteger(normalizedYear) || normalizedYear < 2000) {
      throw new ApiError(400, "Invalid year");
    }
  }

  return {
    categoryId,
    month: normalizedMonth,
    year: normalizedYear,
  };
};

const validateBudgetUpdateData = (data) => {
  const { amount, month, year, categoryId } = data;

  const normalizedAmount = Number(amount);
  const normalizedMonth = Number(month);
  const normalizedYear = Number(year);

  if (categoryId !== undefined) {
    validateObjectId(categoryId, "Category");
  }

  if (normalizedAmount !== undefined) {
    if (
      !Number.isInteger(normalizedAmount) ||
      !Number.isFinite(normalizedAmount) ||
      normalizedAmount < 0
    ) {
      throw new ApiError(400, "Enter positive finite amount value");
    }
  }

  if (normalizedMonth !== undefined) {
    if (
      !Number.isInteger(normalizedMonth) ||
      normalizedMonth < 1 ||
      normalizedMonth > 12
    ) {
      throw new ApiError(400, "Month must be between 1 and 12");
    }
  }

  if (normalizedYear !== undefined) {
    if (!Number.isInteger(normalizedYear) || normalizedYear < 2000) {
      throw new ApiError(400, "Invalid year");
    }
  }

  return {
    categoryId,
    amount: normalizedAmount,
    month: normalizedMonth,
    year: normalizedYear,
  };
};

export {
  validateBudgetDataInput,
  validateBudgetFilters,
  validateBudgetUpdateData,
};
