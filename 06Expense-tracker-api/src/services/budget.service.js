import { ApiError } from "../utils/ApiError.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { Category } from "../models/category.model.js";
import { Budget } from "../models/budget.model.js";
import { validateBudgetDataInput } from "../validators/budget.validator.js";

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

export { createBudgetService };
