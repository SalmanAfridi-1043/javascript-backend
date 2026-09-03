import { ApiError } from "../../../utils/ApiError.js";
import { Product } from "../../products/model/product.model.js";
import { ProductVariant } from "../../products/model/productVariant.model.js";
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

const clearCartService = async (userId) => {
  validateRequired(userId, "User id");

  const cart = await Cart.findOne({ user: userId });

  validateNotFound(cart, "Cart");

  cart.items = [];

  await cart.save();

  return { success: true };
};

const getCartSummaryService = async (userId) => {
  validateNotFound(userId, "user id");

  const cart = await Cart.findOne({ user: userId })
    .populate("items.product")
    .populate("items.variant");

  validateNotFound(cart, "Cart");

  if (cart.items.length === 0) {
    return [];
  }

  // it ll retrun an array of objects
  const cartItems = cart.items.map((item) => {
    const price = item.variant.price;

    const subtotal = price * item.quantity;

    // converting to object
    return {
      ...item.toObject(), // destructuring all its field + new fields
      price,
      subtotal,
    };
  });

  const totalItems = cartItems.length;
  const subtotal = cartItems.reduce((total, item) => total + item.subtotal, 0);

  return {
    cartItems,
    totalItems,
    subtotal,
  };
};

const validateCartService = async (userId) => {
  validateNotFound(userId, "user id");

  const cart = await Cart.findOne({ user: userId });

  validateNotFound(cart, "Cart");

  if (cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  for (const item of cart.items) {
    const isProductExists = await Product.findOne({
      _id: item.product,
      isActive: true,
    });

    validateNotFound(isProductExists, "product");

    const isVariantExists = await ProductVariant.findOne({
      _id: item.variant,
      isActive: true,
    });

    validateNotFound(isVariantExists, "Variant");

    if (item.quantity > isVariantExists.stock) {
      throw new ApiError(409, "Quantity exceed stock limit");
    }
  }

  return {
    valid: true,
  };
};

const syncCartService = async (userId) => {
  validateNotFound(userId, "user id");

  const cart = await Cart.findOne({ user: userId });

  validateNotFound(cart, "Cart");

  // store only the valid and active store items in cart
  let cartItems = [];

  for (const item of cart.items) {
    // check product is active
    const product = await Product.findOne({
      _id: item.product,
      isActive: true,
    });

    // check variant is active
    const variant = await ProductVariant.findOne({
      _id: item.variant,
      isActive: true,
    });

    // if stock is 0 then dont add this item but instead continue
    if (!product || !variant || variant.stock === 0) {
      continue;
    }

    // if stock has reduced and the quantity is greater then reset it to stock level
    if (item.quantity > variant.stock) {
      item.quantity = variant.stock;
    }

    cartItems.push(item);
  }

  cart.items = cartItems;

  await cart.save();

  return cart;
};

export {
  addToCartService,
  getCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
  getCartSummaryService,
  validateCartService,
  syncCartService,
};
