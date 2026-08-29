import { Schema, model } from "mongoose";

const couponUsageSchema = new Schema(
  {
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// one coupon is unique to one user only
couponUsageSchema.index({ coupon: 1, user: 1 });

// one order can have unique coupon (discount etc.)
couponUsageSchema.index({ order: 1 }, { unique: true });

export const CouponUsage = model("CouponUsage", couponUsageSchema);

// CouponUsage is the record/history of people who used that coupon/offer/discount

// Example:
// SAVE10
// Ali → Order #101 → used
// Ahmed → Order #102 → used
// Salman → Order #103 → used.

// So:

// Coupon =  The discount offer/off on product
// CouponUsage =  Record of who used the offer

// We need CouponUsage to enforce rules such as: "Each customer can use SAVE10 only once." and to maintain a history of coupon usage.
