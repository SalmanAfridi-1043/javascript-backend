import { ApiError } from "../../../utils/ApiError.js";
import { Category } from "../../categories/model/category.model.js";
import { Product } from "../../products/model/product.model.js";
import { ProductVariant } from "../../products/model/productVariant.model.js";
import { Order } from "../../orders/model/order.model.js";
import { Cart } from "../../cart/model/cart.model.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";
import { validateNotFound } from "../../../utils/validateNotFound.js";

import {
  validateCartInputData,
  validateCartQuantity,
} from "../validator/cart.validator.js";

const addToCartService = async (userId, cartData) => {
  validateRequired(userId, "user id");

  const { productId, variantId, quantity } = validateCartInputData(cartData);

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  validateNotFound(product, "product");

  const variant = await ProductVariant.findOne({
    _id: variantId,
    product: productId,
    isActive: true,
  });

  validateNotFound(variant, "Product variant");

  if (variant.stock <= 0) {
    throw new ApiError(404, "Out of stock");
  }

  if (quantity > variant.stock) {
    throw new ApiError(409, "Requested quantity exceeds available stock");
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    // then create cart and add the current item
    cart = await Cart.create({
      user: userId,
      items: [
        {
          product: productId,
          variant: variantId,
          quantity,
        },
      ],
    });

    return cart;
  }

  // Check whether this variant already exists in the cart
  // items is an array of objects
  const existingItem = cart.items.find(
    (item) => item.variant.toString() === variantId.toString(),
  );

  // If variant already exists, increase quantity
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    // check if new quantity exceed the stock
    if (newQuantity > variant.stock) {
      throw new ApiError(409, "Cart quantity exceeds available stock");
    }

    existingItem.quantity = newQuantity;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      variant: variantId,
      quantity,
    });
  }

  await cart.save();

  return cart;
};

const getCartService = async (userId) => {
  validateRequired(userId, "User id");

  const cart = await Cart.findById(userId)
    .populate("items.product")
    .populate("items.variant");

  validateNotFound(cart, "User cart");

  return cart;
};

const updateCartItemService = async (userId, itemId, itemQuantity) => {
  validateRequired(userId, "User id");
  validateRequired(itemId, "Item id");

  validateObjectId(itemId, "Item");

  const { quantity } = validateCartQuantity(itemQuantity);

  const cart = await Cart.findOne({ user: userId });

  validateNotFound(cart, "Cart");

  // Find embedded cart item using its generated _id in model
  const existingItem = cart.items.id(itemId);

  if (!existingItem) {
    throw new ApiError(404, "No item found in cart");
  }

  const itemVariant = await ProductVariant.findOne({
    _id: existingItem.variant,
    isActive: true,
  });

  validateNotFound(itemVariant, "Item variant");

  if (quantity > itemVariant.stock) {
    throw new ApiError(409, "Quantity exceed the stock limit");
  }

  existingItem.quantity = quantity;

  await cart.save();

  return cart;
};

const removeCartItemService = async (userId, itemId) => {
  validateRequired(userId, "User id");
  validateRequired(itemId, "Item id");

  validateObjectId(itemId, "Item");

  const cart = await Cart.findOne({ user: userId });

  validateNotFound(cart, "Cart");

  const cartItem = cart.items.id(itemId);

  validateNotFound(cartItem, "Cart item");

  cart.items.pull(cartItem);

  await cart.save();

  return cart;
};

export {
  addToCartService,
  getCartService,
  updateCartItemService,
  removeCartItemService,
};
