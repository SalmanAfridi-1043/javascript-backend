import { ApiError } from "../../../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { Order } from "../../orders/model/order.model.js";
import { Address } from "../../addresses/model/address.model.js";
import { Notification } from "../../notifications/model/notification.model.js";
import { Category } from "../../categories/model/category.model.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";
import { validateNotFound } from "../../../utils/validateNotFound.js";
import { createSafeUser } from "../../../utils/sanitizeUser.js";
import bcrypt from "bcrypt";

import { validateCategoryInputData } from "../validator/category.validator.js";

const createCategoryService = async (categoryData) => {
  const { name, description, isActive } =
    validateCategoryInputData(categoryData);

  const { categoryImage } = categoryData;

  const isCategoryExists = await Category.findOne({ name });

  if (isCategoryExists) {
    throw new ApiError(409, "Category with name already exists");
  }

  const category = await Category.create({
    name,
    description,
    isActive: isActive ?? true,
    image: categoryImage ?? null,
  });

  return category;
};

const getAllCategoriesService = async () => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });

  if (categories.length === 0) {
    throw new ApiError(404, "No category found");
  }

  const totalCount = categories.length;

  return {
    categories,
    total: totalCount,
  };
};

export { createCategoryService, getAllCategoriesService };
