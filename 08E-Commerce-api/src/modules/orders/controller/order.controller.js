import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

import { createOrderService } from "../service/order.service.js";

const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const { shippingAddress } = req.body;

  const order = await createOrderService(userId, shippingAddress);

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
});

export { createOrder };
