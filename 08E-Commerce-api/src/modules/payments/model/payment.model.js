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

    provider: {
      type: String,
      enum: ["STRIPE"],
      required: true,
    },

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

// unique user for one payment
paymentSchema.index({ user: 1 });

// unique status for one payment
paymentSchema.index({ status: 1 });

// if providerPayment id is given then it must be unique for payment
// This is useful because a PENDING payment may not have a provider payment ID yet.
// providerPaymentId will be avaliable only if someone by the product
paymentSchema.index({ providerPaymentId: 1 }, { sparse: true });

export const Payment = model("Payment", paymentSchema);
