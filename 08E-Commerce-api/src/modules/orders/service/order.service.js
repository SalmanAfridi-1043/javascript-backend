import { ApiError } from "../../../utils/ApiError.js";
import { Product } from "../../products/model/product.model.js";
import { ProductVariant } from "../../products/model/productVariant.model.js";
import { Cart } from "../../cart/model/cart.model.js";
import { Order } from "../model/order.model.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";
import { validateNotFound } from "../../../utils/validateNotFound.js";
import { generateOrderNumber } from "../../../utils/orderNumberGenerator.js";

import {
  validateOrderInputAddress,
  validateOrderParams,
} from "../validator/order.validator.js";

const createOrderService = async (userId, shippingAddress) => {
  validateRequired(userId, "User id");

  const validatedShippingAddress = validateOrderInputAddress(shippingAddress);

  const cart = await Cart.findOne({ user: userId });

  validateNotFound(cart, "Cart");

  if (cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = await Product.findOne({
      _id: item.product,
      isActive: true,
    });

    validateNotFound(product, "Product");

    const variant = await ProductVariant.findOne({
      _id: item.variant,
      product: item.product,
      isActive: true,
    });

    validateNotFound(variant, "variant");

    if (item.quantity > variant.stock) {
      throw new ApiError(409, "Quantity exceed stock limit");
    }

    const price = variant.price;
    const itemSubtotal = price * item.quantity;

    // Create an Order Item snapshot
    orderItems.push({
      product: product._id,
      variant: variant._id,
      productName: product.name,
      sku: variant.sku,
      priceAtPurchase: price,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    });

    // combine subtotal price of all items
    subtotal += itemSubtotal;
  }

  const discount = 0;
  const shippingFee = 0;
  const tax = 0;

  // total after chargers
  const total = subtotal - discount + shippingFee + tax;

  const orderNumber = generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    user: userId,
    items: orderItems,
    shippingAddress: validatedShippingAddress,
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
  });

  for (const item of cart.items) {
    const variant = await ProductVariant.findOne({
      _id: item.variant,
      isActive: true,
    });

    validateNotFound(variant, "Variant");

    // reduce the stock by quantity coz if order places, then stock will reduce
    variant.stock -= item.quantity;

    await variant.save();
  }

  cart.items = [];

  await cart.save();

  return order;
};

const getMyOrdersService = async (userId, queryParams) => {
  validateRequired(userId, "user id ");

  const { page, limit } = validateOrderParams(queryParams);

  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: userId })
    .populate("items.variant")
    .populate("items.product")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  if (orders.length === 0) {
    throw new ApiError(404, "No order found");
  }

  const totalOrders = await Order.countDocuments({ user: userId });
  const pages = Math.ceil(totalOrders / limit);
  const previousPage = page > 1;
  const nextPage = page < pages;

  return {
    orders,
    total: totalOrders,
    page,
    limit,
    previousPage,
    nextPage,
  };
};

const getOrderByIdService = async (userId, orderId) => {
  validateRequired(userId, "User id");
  validateRequired(orderId, "Order id");

  validateObjectId(orderId, "Order");

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  })
    .populate("items.variant")
    .populate("items.product");

  validateNotFound(order, "Order");

  return order;
};

export { createOrderService, getMyOrdersService, getOrderByIdService };
