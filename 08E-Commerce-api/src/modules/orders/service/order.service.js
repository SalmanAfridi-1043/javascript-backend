import mongoose from "mongoose";
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
  validateOrderReturnData,
  validateOrderStatus,
} from "../validator/order.validator.js";

const createOrderService = async (userId, shippingAddress) => {
  // MongoDB transaction session: groups multiple database operations into one
  // atomic unit — either all operations succeed (commit) or all changes are
  // undone (rollback). The same session must be passed to every DB operation
  // that belongs to this transaction.
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
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

    // Create the order inside the current MongoDB transaction.
    // Using the session ensures this order creation is committed or rolled back
    // together with the other database operations in this transaction.
    // Why [order] - Mongoose's Model.create() uses the options object with the session when creating documents as an array.
    const [order] = await Order.create(
      [
        {
          orderNumber,
          user: userId,
          items: orderItems,
          shippingAddress: validatedShippingAddress,
          subtotal,
          discount,
          shippingFee,
          tax,
          total,
        },
      ],
      { session },
    );

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

      // now with session, the variant will update/save only when the session/transaction become successfull . Else the processes will be reversed.
      await variant.save({ session });
    }

    cart.items = [];

    await cart.save({ session });

    await session.commitTransaction();

    return order;

    /* 
  TRANSACTION: "Do everything, or do nothing if any fails"
  Order creation performs multiple related database writes:
    1. Create the order
    2. Reduce variant stock
    3. Clear the user's cart

  All these writes must succeed together. If any operation fails,
  the transaction rolls back all previous changes, keeping the database
  consistent (no order without stock reduction, and no stock reduction
  without clearing the cart).

  session → represents the transaction context.
  startTransaction() → starts the transaction.
  { session } → attaches database writes to the transaction.
  commitTransaction() → permanently saves all changes when everything succeeds.
  abortTransaction() → rolls back all changes if any operation fails.
  endSession() → closes the MongoDB session after completion/failure.
    */
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
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

const requestReturnService = async (userId, orderId, note) => {
  validateRequired(userId, "User id");
  validateRequired(orderId, "Order id");

  validateObjectId(orderId, "order");

  const normalizedNote = note !== undefined ? note?.trim() : undefined;

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  validateNotFound(order, "Order");

  if (order.orderStatus !== "DELIVERED") {
    throw new ApiError(
      409,
      "Invalid current status!. Order cannot be returned",
    );
  }

  order.orderStatus = "RETURN_REQUESTED";

  await order.save();

  await OrderStatusHistory.create({
    order: orderId,
    status: order.orderStatus,
    note: normalizedNote ?? null,
    changedBy: userId,
  });

  return order;
};

const updateReturnStatusService = async (adminId, orderId, returnData) => {
  validateRequired(adminId, "Admin id");
  validateRequired(orderId, "Order id");

  validateObjectId(orderId, "order");

  const { status, note } = validateOrderReturnData(returnData);

  const order = await Order.findById(orderId);

  validateNotFound(order, "Order");

  if (order.orderStatus !== "RETURN_REQUESTED") {
    throw new ApiError(
      409,
      "Invalid status!. Order has not been requested to return",
    );
  }

  // if admin reject the order to return, then keep the status as Delivered as client has already recieved the order. So no need to reorder again.
  if (status === "REJECTED") {
    order.orderStatus = "DELIVERED";
  }

  // if admin accept the order to return, then take the order back and restore the stock to include the current return product
  if (status === "APPROVED") {
    order.orderStatus = "RETURNED";

    // update the variant/inventory stock to add the return order product as well
    // variant stock is the main inventory not the product stock
    for (const item of order.items) {
      const variant = await ProductVariant.findById(item.variant);

      validateNotFound(variant, "Variant");

      variant.stock += item.quantity;

      await variant.save();
    }
  }

  await order.save();

  await OrderStatusHistory.create({
    order: orderId,
    status: order.orderStatus,
    note,
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
  requestReturnService,
  updateReturnStatusService,
};
