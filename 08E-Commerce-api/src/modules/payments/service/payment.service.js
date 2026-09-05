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

  // if paymentIntent fails then we'll delete the payment document in catch() so that Database will be consistant. This will handle the Stripe API failer only. so if stripe api fails to pay, then we ll delete the payment document.
  try {
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
  } catch (error) {
    // delete the stripe failer API payment document so that customer may later can retry to pay again
    await Payment.findByIdAndDelete(payment._id);

    throw error;
  }
};

const handleStripeWebhookService = async (event) => {
  // event - used to show the type of stripe event

  // check if event type is success
  if (event.type !== "payment_intent.succeeded") {
    // now this intent has the stripe transaction info like id,signature
    const paymentIntent = event.data.object; // get the body data like id etc

    // using stripe transaction id to find the payment.
    const payment = await Payment.findOne({
      providerPaymentId: paymentIntent.id,
    });

    validateNotFound(payment, "Payment");

    // this will protect mutliple stripe event for same payment. if payment is succeeded then reject the rest of stripes tries for same order payment
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

  // chec if event type is failed
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;

    const payment = await Payment.findOne({
      providerPaymentId: paymentIntent.id,
    });

    validateNotFound(payment, "Payment");

    // if payment status is failed then no need to set to failed again. just return
    if (payment.status === "FAILED") {
      return;
    }

    payment.status = "FAILED";

    await payment.save();

    return;

    // also, if stripe payment fails then order status must be same/pending so that user/client can try again or use an alternate way to pay
  }
};

const retryPaymentService = async (userId, orderId) => {
  validateRequired(userId, "User id");
  validateRequired(orderId, "Order id");

  validateObjectId(orderId, "Order");

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  validateNotFound(order, "Order");

  // A cancelled/returned order cannot be paid:
  if (order.orderStatus === "CANCELLED") {
    throw new ApiError(409, "Order has been canceled");
  }

  if (order.orderStatus === "RETURNED") {
    throw new ApiError(409, "Order has been returned");
  }

  // Also don't retry an already-paid order:
  if (order.paymentStatus === "PAID") {
    throw new ApiError(409, "Order is already paid");
  }

  // find the existing payment for which the payment process was failed. coz it has been created in createPaymentService when we try to make payment. so no need to duplicate payment again but instead find the existing payment document
  const payment = await Payment.findOne({
    order: orderId,
    user: userId,
  });

  validateNotFound(payment, "Payment not found");

  // A failed payment can be retried to complete the payment process
  if (payment.status !== "FAILED") {
    throw new ApiError(409, "Only failed payments can be retried");
  }

  // recreate the paymentIntent for the existing payment document
  const paymentIntent = await stripe.paymentIntents.create({
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

  // now update the existing failed payment for this new payment process
  payment.providerPaymentId = paymentIntent.id;
  payment.status = "PENDING";
  payment.paidAt = undefined;

  await payment.save();

  return {
    payment,
    clientSecret: paymentIntent.client_secret,
  };
};

const refundPaymentService = async (adminId, orderId) => {
  validateRequired(adminId, "Admin id");
  validateRequired(orderId, "Order id");

  validateObjectId(orderId, "Order");

  const order = await Order.findById(orderId);

  validateNotFound(order, "Order");

  if (order.orderStatus !== "RETURNED") {
    throw new ApiError(409, "Only returned orders can be refunded");
  }

  const payment = await Payment.findOne({
    order: order._id,
  });

  validateNotFound(payment, "Payment");

  if (payment.status !== "SUCCEEDED") {
    throw new ApiError(409, "Only successful payments can be refunded");
  }

  // create a refund stripe so that payment can be refunded
  // Stripe uses the original PaymentIntent to know which payment to refund.
  let refund;
  // using trycatch to handle the failer
  try {
    refund = await stripe.refunds.create({
      payment_intent: payment.providerPaymentId,
    });
  } catch (error) {
    throw new ApiError(502, "Refund failed with Stripe");
  }

  // Stripe handles the actual money movement and refund automatically.
  // Our backend only tells Stripe:"Refund this PaymentIntent"
  // Stripe processes refund
  // Money goes back to customer's card

  payment.status = "REFUNDED";
  await payment.save();

  order.paymentStatus = "REFUNDED";
  await order.save();

  return {
    payment,
    order,
    refundId: refund._id,
  };
};

export {
  createPaymentService,
  handleStripeWebhookService,
  retryPaymentService,
  refundPaymentService,
};
