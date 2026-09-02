import { ApiError } from "../../../utils/ApiError.js";
import { Category } from "../../categories/model/category.model.js";
import { Product } from "../../products/model/product.model.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";
import { validateNotFound } from "../../../utils/validateNotFound.js";

import {
  validateProductInputData,
  validateQueryParameters,
} from "../validator/product.validator.js";

const createProductService = async (productData) => {
  const { name, description, brand, categoryId, price, sku, stock } =
    validateProductInputData(productData);

  const { productImages } = productData;

  // check if category exists
  const category = await Category.findOne({
    _id: categoryId,
    isActive: true,
  });
  validateNotFound(category, "category");

  //   SKU = Stock Keeping Unit — a unique code used internally to identify and track a specific product/variant in inventory.
  const isSkuAlreadyExists = await Product.findOne({
    sku,
  });
  if (isSkuAlreadyExists) {
    throw new ApiError(409, "Product Sku already exists");
  }

  const product = await Product.create({
    name,
    description,
    brand,
    category: categoryId,
    price,
    sku,
    productImages, // array of product images
    stock,
  });

  return product;
};

const getAllProductsService = async (queryParams) => {
  const {
    search,
    categoryId,
    brand,
    minPrice,
    maxPrice,
    inStock,
    sort,
    page,
    limit,
  } = validateQueryParameters(queryParams);

  const filterObject = {};

  if (search !== undefined) {
    filterObject.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  if (categoryId !== undefined) {
    const isCategoryExists = await Category.findOne({
      _id: categoryId,
      isActive: true,
    });
    validateNotFound(isCategoryExists, "Category");

    filterObject.category = categoryId;
  }

  // set price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    filterObject.price = {};

    if (minPrice !== undefined) {
      filterObject.price.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      filterObject.price.$lte = maxPrice;
    }
  }

  if (brand !== undefined) {
    filterObject.brand = brand;
  }

  if (inStock !== undefined) {
    filterObject.stock = inStock ? { $gt: 0 } : { $eq: 0 };
  }

  const sortingObject = {};
  if (sort === "price") sortingObject.price = 1;
  if (sort === "-price") sortingObject.price = -1;
  if (sort === "brand") sortingObject.brand = 1;
  if (sort === "-brand") sortingObject.brand = -1;

  const skip = (page - 1) * limit;

  const allProducts = await Product.find(filterObject)
    .sort(sortingObject)
    .skip(skip)
    .limit(limit);

  const totalProducts = await Product.countDocuments(filterObject);

  const pages = Math.ceil(totalProducts / limit);

  const previousPage = page > 1;
  const nextPage = page < pages;

  return {
    allProducts,
    pagination: {
      totalProducts,
      pages,
      page,
      limit,
      previousPage,
      nextPage,
    },
  };
};

export { createProductService, getAllProductsService };
