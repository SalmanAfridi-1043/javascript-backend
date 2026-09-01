import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import uploadOnCloudinary from "../../../config/cloudinary.config.js";

import { createCategoryService } from "../service/category.service.js";

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

export { createCategory };
