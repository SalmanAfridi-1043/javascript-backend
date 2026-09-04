import { ApiError } from "../../../utils/ApiError.js";
import { Order } from "../../orders/model/order.model.js";
import { Payment } from "../model/payment.model.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";
import { validateNotFound } from "../../../utils/validateNotFound.js";
import { stripe } from "../../../config/stripe.config.js";

const createPaymentService = async (userId, orderId) => {
  validateRequired(userId, "User id");
  validateRequired(orderId, "Order id");

  validateObjectId(orderId, "Order");

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  validateNotFound(order, "Order");

  if (order.orderStatus === "CANCELLED") {
    throw new ApiError(409, "Order has been canceled");
  }

  if (order.orderStatus === "RETURNED") {
    throw new ApiError(409, "Order has been returned");
  }

  if (order.paymentStatus === "PAID") {
    throw new ApiError(409, "Payment is already confirmed");
  }

  const isPaymentAlreadyExists = await Payment.findOne({
    order: orderId,
    user: userId,
  });

  if (isPaymentAlreadyExists) {
    throw new ApiError(409, "Payment already exists for this order");
  }

  const payment = await Payment.create({
    order: orderId,
    user: userId,
    provider: "STRIPE",
    amount: order.total,
    currency: "USD",
    status: "PENDING",
  });

  const paymentIntent = await stripe.paymentIntents.create({
    // Why * 100? - Stripe expects USD in cents. (1$ = 100 cents)
    amount: Math.round(order.total * 100),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      orderId: order._id.toString(),
      paymentId: payment._id.toString(),
      userId: userId.toString(),
    },
  });

  payment.providerPaymentId = paymentIntent.id;

  await payment.save();

  return {
    payment,
    clientSecret: paymentIntent.client_secret,
  };
};

const handleStripeWebhookService = async (event) => {
  // event - used to show the type of stripe event
  if (event.type !== "payment_intent.succeeded") {
    // now this intent has the stripe transaction info like id,signature
    const paymentIntent = event.data.object;

    // using stripe transaction id to find the payment.
    const payment = await Payment.findOne({
      providerPaymentId: paymentIntent.id,
    });

    validateNotFound(payment, "Payment");

    // this will protect mutliple stripe event for same payment. if payment is succeeded then reject the rest of stripes for same order payment
    if (payment.status === "SUCCEEDED") {
      return;
    }

    payment.status = "SUCCEEDED";
    payment.paidAt = new Date();

    await payment.save();

    const order = await Order.findById(payment.order);

    validateNotFound(order, "Order");

    order.paymentStatus = "PAID";

    await order.save();

    return;
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;

    const payment = await Payment.findOne({
      providerPaymentId: paymentIntent.id,
    });

    validateNotFound(payment, "Payment");

    // if payment status is failed the no need to set to failed again. just return
    if (payment.status === "FAILED") {
      return;
    }

    payment.status = "FAILED";

    await payment.save();

    return;
  }
};

export { createPaymentService, handleStripeWebhookService };
