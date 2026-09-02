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

const validateQueryParameters = (queryParams) => {
  const {
    search,
    categoryId,
    brand,
    minPrice,
    maxPrice,
    inStock,
    status,
    sort,
    page,
    limit,
  } = queryParams;

  const normalizedSearch = search?.trim();
  const normalizedBrand = brand?.trim();

  const normalizedMinPrice =
    minPrice !== undefined ? Number(minPrice) : undefined;

  const normalizedMaxPrice =
    maxPrice !== undefined ? Number(maxPrice) : undefined;

  const normalizedStatus = status?.trim().toUpperCase();
  const normalizedSort = sort?.trim().toLowerCase();
  const normalizedPage = page !== undefined ? Number(page) : 1;
  const normalizedLimit = limit !== undefined ? Number(limit) : 10;

  if (categoryId !== undefined) {
    validateObjectId(categoryId, "category");
  }

  if (normalizedMinPrice !== undefined) {
    if (normalizedMinPrice < 0 || !Number.isFinite(normalizedMinPrice)) {
      throw new ApiError(400, "Enter positive finite minimum price value");
    }
  }

  if (normalizedMaxPrice !== undefined) {
    if (normalizedMaxPrice < 0 || !Number.isFinite(normalizedMaxPrice)) {
      throw new ApiError(400, "Enter positive finite maximum price value");
    }
  }

  if (normalizedStatus !== undefined) {
    if (!["ACTIVE", "INACTIVE", "OUT_OF_STOCK"].includes(normalizedStatus)) {
      throw new ApiError(400, "Invalid status value");
    }
  }

  let normalizedInstock;
  if (inStock !== undefined) {
    if (inStock !== "true" && inStock !== "false") {
      throw new ApiError(400, "inStock must be true or false");
    }

    normalizedInstock = inStock === "true";
  }

  if (!Number.isInteger(normalizedPage) || normalizedPage < 1) {
    throw new ApiError(400, "Page must be a positive integer");
  }

  if (
    !Number.isInteger(normalizedLimit) ||
    normalizedLimit < 1 ||
    normalizedLimit > 100
  ) {
    throw new ApiError(400, "Limit must be between 1 and 100");
  }

  return {
    search: normalizedSearch,
    categoryId,
    brand: normalizedBrand,
    minPrice: normalizedMinPrice,
    maxPrice: normalizedMaxPrice,
    status: normalizedStatus,
    inStock: normalizedInstock,
    sort: normalizedSort,
    page: normalizedPage,
    limit: normalizedLimit,
  };
};

const validateProductUpdateData = (productUpdateData) => {
  const { name, description, brand, categoryId, price, sku, stock } =
    productUpdateData;

  const normalizedName = name?.trim();
  const normalizedDescription = description?.trim();
  const normalizedBrand = brand?.trim();
  const normalizedPrice = price !== undefined ? Number(price) : undefined;
  const normalizedSku = sku?.trim().toUpperCase();
  const normalizedStock = stock !== undefined ? Number(stock) : undefined;

  if (categoryId !== undefined) {
    validateObjectId(categoryId, "category");
  }

  if (normalizedPrice !== undefined)
    if (normalizedPrice < 0 || !Number.isFinite(normalizedPrice)) {
      throw new ApiError(400, "Enter positive finite price value");
    }

  if (normalizedStock !== undefined)
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

export {
  validateProductInputData,
  validateQueryParameters,
  validateProductUpdateData,
};
