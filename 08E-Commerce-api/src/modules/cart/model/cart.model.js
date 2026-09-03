import { Schema, model } from "mongoose";

// its a helper schema to make the model abit clear rather than covering all the model concept in one field object
const cartItemSchema = new Schema(
  {
    // represent each product here
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // represent each product properties and variants
    variant: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
    },

    // product quantity
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },

  // unique id for each details here
  // it tells Mongoose to give each cart item its own _id.
  { _id: true },
  // So { _id: true } means each object inside items gets its own MongoDB/Mongoose _id, allowing you to identify a specific cart item with itemId.

  // so cartSchema object will ve _id from mongoose. but after this , we forcefully say to mongoose that give _id to cartItemSchema object as well . coz its a field having array of objects
);

// actual cart Schema
const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // array of cart items. (more cleaner approach)
    items: [cartItemSchema],
  },
  { timestamps: true },
);

// user: unique: true means one cart per user.
cartSchema.index({ user: 1 }, { unique: true });

export const Cart = model("Cart", cartSchema);

// Each items entry can optionally reference a ProductVariant, allowing both: Product only , Product + Variant

// No price is stored in the cart. we'll always calculate the current price from the database.
