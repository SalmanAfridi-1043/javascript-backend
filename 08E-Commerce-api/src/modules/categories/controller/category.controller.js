import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import uploadOnCloudinary from "../../../config/cloudinary.config.js";

import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
} from "../service/category.service.js";

const createCategory = asyncHandler(async (req, res) => {
  const categoryData = { ...req.body };

  const categoryImagePath = req.file?.path;

  if (categoryImagePath) {
    const cloudinaryUrl = await uploadOnCloudinary(
      categoryImagePath,
      "E-Commerce-API/category",
    );
    categoryData.categoryImage = cloudinaryUrl?.secure_url;
  }

  const category = await createCategoryService(categoryData);

  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully"));
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await getAllCategoriesService();

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await getCategoryByIdService(categoryId);

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched successfully"));
});

const updateCategory = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  const { categoryId } = req.params;

  const categoryImagePath = req.file?.path;

  if (categoryImagePath) {
    const cloudinaryUrl = await uploadOnCloudinary(
      categoryImagePath,
      "E-Commerce-API/category",
    );
    updateData.categoryImage = cloudinaryUrl?.secure_url;
  }

  const updatedCategory = await updateCategoryService(categoryId, updateData);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedCategory, "Category updated successfully"),
    );
});

export { createCategory, getAllCategories, getCategoryById, updateCategory };
