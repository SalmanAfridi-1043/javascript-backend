import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { stripe } from "../../../config/stripe.config.js";
import env from "../../../config/env.config.js";

import {
  createPaymentService,
  handleStripeWebhookService,
} from "../service/payment.service.js";

const createPayment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { orderId } = req.params;

  const payment = await createPaymentService(userId, orderId);

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

  const event = stripe.webhooks.constructEvent(
    req.rawBody,
    signature,
    env.stripeWebhookSecret,
  );

  await handleStripeWebhookService(event);

  // console.log(event.type);

  return res.status(200).json({
    received: true,
  });
});

export { createPayment, stripeWebhook };
