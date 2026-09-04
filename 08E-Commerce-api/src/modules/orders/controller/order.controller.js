import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

import {
  cancelOrderService,
  createOrderService,
  getMyOrdersService,
  getOrderByIdService,
  requestReturnService,
  updateOrderStatusService,
  updateReturnStatusService,
} from "../service/order.service.js";

const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const { shippingAddress } = req.body;

  const order = await createOrderService(userId, shippingAddress);

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
});

const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const queryParams = req.query;

  const orders = await getMyOrdersService(userId, queryParams);

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const getOrderById = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { orderId } = req.params;

  const userOrder = await getOrderByIdService(userId, orderId);

  return res
    .status(200)
    .json(new ApiResponse(200, userOrder, "Order fetched successfully"));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { orderId } = req.params;

  const canceledOrder = await cancelOrderService(userId, orderId);

  return res
    .status(200)
    .json(new ApiResponse(200, canceledOrder, "Order canceled successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const adminId = req.user?._id;
  const { orderId } = req.params;
  const { status } = req.body;

  const updatedOrder = await updateOrderStatusService(adminId, orderId, status);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedOrder, "Order status updated successfully"),
    );
});

const requestReturn = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { orderId } = req.params;
  const { note } = req.body;

  const returnedOrder = await requestReturnService(userId, orderId, note);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        returnedOrder,
        "Order requested to return successfully",
      ),
    );
});

const updateReturnStatus = asyncHandler(async (req, res) => {
  const adminId = req.user?._id;
  const { orderId } = req.params;
  const returnData = req.body;

  const updatedOrder = await updateReturnStatusService(adminId, orderId, returnData);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedOrder, "Order status updated successfully"),
    );
});

export {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  requestReturn,
  updateReturnStatus,
};
