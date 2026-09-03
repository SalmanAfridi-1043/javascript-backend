import { ApiError } from "../../../utils/ApiError.js";
import { Product } from "../../products/model/product.model.js";
import { ProductVariant } from "../../products/model/productVariant.model.js";
import { Cart } from "../../cart/model/cart.model.js";
import { Order } from "../model/order.model.js";
import { OrderStatusHistory } from "../model/orderStatusHistory.model.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";
import { validateNotFound } from "../../../utils/validateNotFound.js";
import { generateOrderNumber } from "../../../utils/orderNumberGenerator.js";

import {
  validateOrderInputAddress,
  validateOrderParams,
  validateOrderStatus,
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

  // just need to be stored in mongoDB for history tracking
  await OrderStatusHistory.create({
    order: order._id,
    status: order.orderStatus, //PENDING by default
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

const cancelOrderService = async (userId, orderId) => {
  validateRequired(userId, "User id");
  validateRequired(orderId, "Order id");

  validateObjectId(orderId, "Order");

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  validateNotFound(order, "Order");

  // only PENDING CONFIRMED status are allowed if order has placed and user wana cancel it
  if (!["PENDING", "CONFIRMED"].includes(order.orderStatus)) {
    throw new ApiError(409, "Order cannot be canceled");
  }

  // update the order status
  order.orderStatus = "CANCELLED";

  // update the payment status
  if (order.paymentStatus === "PAID") {
    order.paymentStatus = "REFUNDED"; // refunding logic will be later
  }

  // now update the stock for each item coz if order - canceled then stock should be incresed
  for (const item of order.items) {
    const variant = await ProductVariant.findById(item.variant);

    if (variant) {
      variant.stock += item.quantity;

      await variant.save();
    }
  }

  await order.save();

  return order;
};

const updateOrderStatusService = async (adminId, orderId, status) => {
  validateRequired(adminId, "Admin id");
  validateRequired(orderId, "Order id");
  validateObjectId(orderId, "Order");

  const { orderStatus } = validateOrderStatus(status);

  const order = await Order.findById(orderId);

  validateNotFound(order, "Order");

  /*
  if (order.orderStatus === "PENDING") {
    if (orderStatus === "CONFIRMED" || orderStatus === "CANCELLED") {
      order.orderStatus = orderStatus;
    } else {
      throw new ApiError(400, "Invalid status transition");
    }
  } else if (order.orderStatus === "CONFIRMED") {
    if (orderStatus === "PROCESSING" || orderStatus === "CANCELLED") {
      order.orderStatus = orderStatus;
    } else {
      throw new ApiError(400, "Invalid status transition");
    }
  } else if (order.orderStatus === "PROCESSING") {
    if (orderStatus === "SHIPPED") {
      order.orderStatus = orderStatus;
    } else {
      throw new ApiError(400, "Invalid status transition");
    }
  } else if (order.orderStatus === "SHIPPED") {
    if (orderStatus === "DELIVERED") {
      order.orderStatus = orderStatus;
    } else {
      throw new ApiError(400, "Invalid status transition");
    }
  } else if (order.orderStatus === "RETURN_REQUESTED") {
    if (orderStatus === "RETURNED") {
      order.orderStatus = orderStatus;
    } else {
      throw new ApiError(400, "Invalid status transition");
    }
  } else if (
    orderStatus === "DELIVERED" ||
    orderStatus === "CANCELLED" ||
    orderStatus === "RETURNED"
  ) {
    {
      throw new ApiError(409, "Invalid status transition");
    }
  } else {
    throw new ApiError(409, "Invalid status transition");
  }
  */

  // below is shorter method of the above one
  const allowedTransitions = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
    RETURN_REQUESTED: ["RETURNED"],
    RETURNED: [],
  };

  if (!allowedTransitions[order.orderStatus].includes(orderStatus)) {
    throw new ApiError(409, "Invalid status transition");
  }

  order.orderStatus = orderStatus;

  await order.save();

  await OrderStatusHistory.create({
    order: order._id,
    status: order.orderStatus,
    changedBy: adminId,
  });

  return order;
};

export {
  createOrderService,
  getMyOrdersService,
  getOrderByIdService,
  cancelOrderService,
  updateOrderStatusService,
};
