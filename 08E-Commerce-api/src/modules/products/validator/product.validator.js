import { ApiError } from "../../../utils/ApiError.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";

const validateProductInputData = (productData) => {
  const { name, description, brand, categoryId, price, sku, stock } =
    productData;

  const normalizedName = name?.trim();
  const normalizedDescription = description?.trim();
  const normalizedBrand = brand?.trim();
  const normalizedPrice = Number(price);
  const normalizedSku = sku?.trim().toUpperCase();
  const normalizedStock = Number(stock);

  validateRequired(normalizedName, "Product name");
  validateRequired(normalizedDescription, "Product description");

  validateRequired(categoryId, "Category id");
  validateObjectId(categoryId, "category");

  validateRequired(normalizedPrice, "Product price");
  if (normalizedPrice < 0 || !Number.isFinite(normalizedPrice)) {
    throw new ApiError(400, "Enter positive finite price value");
  }

  validateRequired(normalizedSku, "Product sku");

  validateRequired(normalizedStock, "Product stock");
  if (
    normalizedStock < 0 ||
    !Number.isFinite(normalizedStock) ||
    !Number.isInteger(normalizedStock)
  ) {
    throw new ApiError(400, "Enter positive finite stock value");
  }

  return {
    name: normalizedName,
    description: normalizedDescription,
    brand: normalizedBrand,
    categoryId,
    price: normalizedPrice,
    sku: normalizedSku,
    stock: normalizedStock,
  };
};

export { validateProductInputData };
