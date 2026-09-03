import { ApiError } from "../../../utils/ApiError.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";

const validateCartInputData = (cartData) => {
  const { productId, variantId, quantity } = cartData;

  const normalizedQuantity =
    quantity !== undefined ? Number(quantity) : undefined;

  validateRequired(productId, "Product id");
  validateObjectId(productId, "Product");

  validateRequired(variantId, "Variant id");
  validateObjectId(variantId, "Variant");

  validateRequired(normalizedQuantity, "Quantity value");

  if (
    !Number.isFinite(normalizedQuantity) ||
    !Number.isInteger(normalizedQuantity) ||
    normalizedQuantity < 1
  ) {
    throw new ApiError(400, "Enter positive finite quantity value");
  }

  return {
    productId,
    variantId,
    quantity: normalizedQuantity,
  };
};

const validateCartQuantity = (itemQuantity) => {
  const normalizedQuantity =
    itemQuantity !== undefined ? Number(quantity) : undefined;

  validateRequired(itemQuantity, "Item Quantity");

  if (
    !Number.isFinite(normalizedQuantity) ||
    !Number.isInteger(normalizedQuantity) ||
    normalizedQuantity < 1
  ) {
    throw new ApiError(400, "Enter positive finite quantity value");
  }

  return {
    quantity: normalizedQuantity,
  };
};

export { validateCartInputData, validateCartQuantity };
