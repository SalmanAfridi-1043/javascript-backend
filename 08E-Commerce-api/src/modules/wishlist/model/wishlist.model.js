import { Schema, model } from "mongoose";

const wishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true },
);

// One wishlist per user, containing an array of product references.
wishlistSchema.index({ user: 1 }, { unique: true });

export const Wishlist = model("Wishlist", wishlistSchema);

// A wishlist is basically a user's saved/favorite products.
// Example:You see a laptop you like but don't want to buy yet → you click ❤️ Add to Wishlist.

// 🛒 Cart → products you intend to buy.
// ❤️ Wishlist → products you want to remember/save for later.
