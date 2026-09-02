import { ApiError } from "../../../utils/ApiError.js";
import { validateRequired } from "../../../utils/validateRequired.js";

const validateVariantInputData = (variantData) => {
  const { sku, attributes, price, stock } = variantData;

  const normalizedSku = sku?.trim().toUpperCase();
  const normalizedPrice = price !== undefined ? Number(price) : undefined;
  const normalizedStock = stock !== undefined ? Number(stock) : undefined;

  validateRequired(normalizedSku, "Sku");

  if (
    !attributes ||
    typeof attributes !== "object" ||
    Array.isArray(attributes) ||
    Object.keys(attributes).length === 0
  ) {
    throw new ApiError(400, "Attributes must be a non-empty object");
  }

  if (normalizedPrice !== undefined) {
    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      throw new ApiError(400, "Enter positive finite price value");
    }
  }

  validateRequired(normalizedStock, "Stock");
  if (
    !Number.isInteger(normalizedStock) ||
    !Number.isFinite(normalizedStock) ||
    normalizedStock < 0
  ) {
    throw new ApiError(400, "Enter positive finite stock value");
  }

  return {
    sku: normalizedSku,
    attributes,
    price: normalizedPrice,
    stock: normalizedStock,
  };
};

const validateVariantUpdateData = (variantUpdateData) => {
  const { sku, attributes, price, stock } = variantUpdateData;

  const normalizedSku = sku?.trim().toUpperCase();
  const normalizedPrice = price !== undefined ? Number(price) : undefined;
  const normalizedStock = stock !== undefined ? Number(stock) : undefined;

  if (
    (attributes !== undefined && typeof attributes !== "object") ||
    Array.isArray(attributes) ||
    Object.keys(attributes).length === 0
  ) {
    throw new ApiError(400, "Attributes must be a non-empty object");
  }

  if (normalizedPrice !== undefined) {
    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      throw new ApiError(400, "Enter positive finite price value");
    }
  }

  if (normalizedStock !== undefined) {
    if (
      !Number.isInteger(normalizedStock) ||
      !Number.isFinite(normalizedStock) ||
      normalizedStock < 0
    ) {
      throw new ApiError(400, "Enter positive finite stock value");
    }
  }

  return {
    sku: normalizedSku,
    attributes,
    price: normalizedPrice,
    stock: normalizedStock,
  };
};

const validateVariantStock = (stock) => {
  const normalizedStock = stock !== undefined ? Number(stock) : undefined;

  validateRequired(normalizedStock, "Stock value");

  if (
    !Number.isFinite(normalizedStock) ||
    !Number.isInteger(normalizedStock) ||
    normalizedStock < 0
  ) {
    throw new ApiError(400, "Enter positive finite stock value");
  }

  return { stock: normalizedStock };
};

export {
  validateVariantInputData,
  validateVariantUpdateData,
  validateVariantStock,
};
