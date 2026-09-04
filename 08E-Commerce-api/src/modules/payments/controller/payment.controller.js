import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

import { createPaymentService } from "../service/payment.service.js";

const createPayment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { orderId } = req.params;

  const payment = await createPaymentService(userId, orderId);

  return res
    .status(201)
    .json(new ApiResponse(201, payment, "Payment created successfully"));
});

export { createPayment };
