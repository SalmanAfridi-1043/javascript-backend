import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Stripe = the payment service/provider that actually processes the card payment.
    provider: {
      type: String,
      enum: ["STRIPE", "COD"],
      required: true,
    },

    // Example:
    // Your Order: ORD-123
    //  ↓
    // Stripe processes payment (using card etc)
    //  ↓
    // Stripe Payment ID: pi_3AbC123... (id of card while processing)

    // You store pi_3AbC123... in providerPaymentId so your system can identify that exact Stripe payment.

    // providerPaymentId = Stripe's unique ID for that payment, so you can track/verify it later.Actually stripe payment generates unique id, so we store it here.
    // sparse: true ---> allows multiple documents where providerPaymentId is missing, while still enforcing uniqueness when a value exists.
    providerPaymentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      default: "USD",
      uppercase: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    transactionId: {
      type: String,
      trim: true,
    },

    paidAt: {
      type: Date,
    },

    metadata: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true },
);

// indexes for faster queries
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });

// if providerPayment id is given then it must be unique for payment
// This is useful because a PENDING payment may not have a provider payment ID yet.
// providerPaymentId will be avaliable only if someone by the product
paymentSchema.index({ providerPaymentId: 1 }, { sparse: true });

export const Payment = model("Payment", paymentSchema);
