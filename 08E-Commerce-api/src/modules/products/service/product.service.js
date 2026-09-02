import { ApiError } from "../../../utils/ApiError.js";
import { Category } from "../../categories/model/category.model.js";
import { Product } from "../../products/model/product.model.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";
import { validateNotFound } from "../../../utils/validateNotFound.js";

import { validateProductInputData } from "../validator/product.validator.js";

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

export { createProductService };
