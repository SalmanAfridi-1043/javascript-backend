import { Schema, model } from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // discountType lets the same system support:
    // SAVE10 → 10% and SAVE500 → $500 off (both % and fixed value)
    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FIXED"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // maximumDiscountAmount is especially important for percentage coupons so a large order can't create an unlimited discount.
    maximumDiscountAmount: {
      type: Number,
      min: 0,
    },

    usageLimit: {
      type: Number,
      min: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ expiresAt: 1 });

export const Coupon = model("Coupon", couponSchema);

// A coupon is a promotional discount code customers enter during checkout.
// Example:
// Order = $5,000
// Coupon = SAVE10
// Discount = 10%
// Final = $4,500

// We need it so the e-commerce system can support promotions, discounts, marketing campaigns, and special offers.

// in simple words:
// A coupon is the discount offer//off on product/code itself.
// Coupon:
// Code: SAVE10
// Discount: 10%
// Usage limit: 100
// Expires: Dec 31

// Coupon =  The discount offer/off on product
// CouponUsage =  Record of who used the offer
