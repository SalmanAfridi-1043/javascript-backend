import { ApiError } from "../../../utils/ApiError.js";
import { validateRequired } from "../../../utils/validateRequired.js";

const validateCategoryInputData = (categoryData) => {
  const { name, description, isActive } = categoryData;

  const normalizedName = name?.trim();
  const normalizedDescription = description?.trim();

  validateRequired(normalizedName, "Category name");

  if (isActive !== undefined && typeof isActive !== "boolean") {
    throw new ApiError(400, "Enter a boolean value");
  }

  return {
    name: normalizedName,
    description: normalizedDescription,
    isActive,
  };
};

export { validateCategoryInputData };
