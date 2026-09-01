import { ApiError } from "../../../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { Order } from "../../orders/model/order.model.js";
import { Address } from "../../addresses/model/address.model.js";
import { Notification } from "../../notifications/model/notification.model.js";
import { Category } from "../../categories/model/category.model.js";
import { Product } from "../../products/model/product.model.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";
import { validateNotFound } from "../../../utils/validateNotFound.js";
import bcrypt from "bcrypt";

import {
  validateCategoryInputData,
  validateCategoryUpdateData,
} from "../validator/category.validator.js";

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

const getCategoryByIdService = async (categoryId) => {
  validateRequired(categoryId, "Category id");
  validateObjectId(categoryId, "Category");

  const category = await Category.findOne({
    _id: categoryId,
    isActive: true,
  });

  validateNotFound(category, "Category");

  return category;
};

const updateCategoryService = async (categoryId, updateData) => {
  validateRequired(categoryId, "Category id");
  validateObjectId(categoryId, "Category");

  const { name, description, isActive } =
    validateCategoryUpdateData(updateData);

  const { categoryImage } = updateData;

  // as name should be unique so check the name if user wana change the it
  if (name !== undefined) {
    const existingCategory = await Category.findOne({
      name,
      _id: { $ne: categoryId },
    });

    if (existingCategory) {
      throw new ApiError(409, "Category with this name already exists");
    }
  }

  // check is the category user wana update exists ?
  const isCategoryExists = await Category.findById(categoryId);

  validateNotFound(isCategoryExists, "Category");

  const updateObject = {};

  if (name !== undefined) {
    updateObject.name = name;
  }

  if (description !== undefined) {
    updateObject.description = description;
  }

  if (isActive !== undefined) {
    updateObject.isActive = isActive;
  }

  if (categoryImage !== undefined) {
    updateObject.image = categoryImage;
  }

  const updateCategory = await Category.findByIdAndUpdate(
    categoryId,
    {
      $set: updateObject,
    },
    {
      new: true,
    },
  );

  return updateCategory;
};

const deleteCategoryService = async (categoryId) => {
  validateRequired(categoryId, "Category id");
  validateObjectId(categoryId, "Category");

  const category = await Category.findById(categoryId);

  validateNotFound(category, "category");

  const isCategoryProductExists = await Product.findOne({
    category: categoryId,
  });

  if (isCategoryProductExists) {
    throw new ApiError(
      409,
      "Deletion rejected!. Product is associated with category",
    );
  }

  category.isActive = false;
  await category.save();

  return { success: true };
};

export {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService,
};
