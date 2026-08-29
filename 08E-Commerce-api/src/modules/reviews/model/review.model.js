import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// unique review for one product (each product has its own review. other can't use it)
reviewSchema.index({ product: 1 });

// one user can review on one product at a time
// prevents the same user from creating multiple reviews for the same product.
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

export const Review = model("Review", reviewSchema);

// The actual “did this user purchase this product?” check will happen in the service/business logic, not the model.
