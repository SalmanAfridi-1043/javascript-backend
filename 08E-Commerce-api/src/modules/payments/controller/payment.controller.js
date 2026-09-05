import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { stripe } from "../../../config/stripe.config.js";
import env from "../../../config/env.config.js";

import {
  confirmCODPaymentService,
  createPaymentService,
  getAllPaymentsService,
  getMyPaymentsService,
  getPaymentDetailsService,
  handleStripeWebhookService,
  refundPaymentService,
  retryPaymentService,
} from "../service/payment.service.js";

const createPayment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { orderId } = req.params;
  const { provider } = req.body;

  const payment = await createPaymentService(userId, orderId, provider);

  return res
    .status(201)
    .json(new ApiResponse(201, payment, "Payment created successfully"));
});

const stripeWebhook = asyncHandler(async (req, res) => {
  /*
  stripe body look like this 
      { id="q3a7xw"
        req.headers["stripe-signature"]
      }
  */

  const signature = req.headers["stripe-signature"];

  // event helps us to find the type of stripe event
  const event = stripe.webhooks.constructEvent(
    req.rawBody,
    signature,
    env.stripeWebhookSecret, // key in .env - used by our server to verifies that the webhook actually came from Stripe
  );

  // handle the business logic using service layer
  await handleStripeWebhookService(event);

  return res.status(200).json({
    received: true,
  });
});

const retryPayment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { orderId } = req.params;

  const payment = await retryPaymentService(userId, orderId);

  return res
    .status(200)
    .json(new ApiResponse(200, payment, "Payment confirmed successfully"));
});

const refundPayment = asyncHandler(async (req, res) => {
  const adminId = req.user._id;
  const { orderId } = req.params;

  const refundedPaymentDetails = await refundPaymentService(adminId, orderId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        refundedPaymentDetails,
        "Payment refunded successfully",
      ),
    );
});

const getAllPayments = asyncHandler(async (req, res) => {
  // no Admin id here. coz adminMiddleware already verifies its role.
  const queryData = req.query;

  const payments = await getAllPaymentsService({ queryData });

  return res
    .status(200)
    .json(new ApiResponse(200, payments, "Payments fetched successfully"));
});

const getPaymentDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { orderId } = req.params;

  const paymentDetails = await getPaymentDetailsService(userId, orderId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        paymentDetails,
        "Payment details fetched successfully",
      ),
    );
});

const getMyPayments = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const allPayments = await getMyPaymentsService(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, allPayments, "All payments fetched successfully"),
    );
});

const confirmCODPayment = asyncHandler(async (req, res) => {
  // only admin can confirm the COD payment
  const adminId = req.user._id;
  const { orderId } = req.params;

  const codPayment = await confirmCODPaymentService(adminId, orderId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, codPayment, "COD payment confirmed successfully"),
    );
});

export {
  createPayment,
  stripeWebhook,
  retryPayment,
  refundPayment,
  getAllPayments,
  getPaymentDetails,
  getMyPayments,
  confirmCODPayment,
};
