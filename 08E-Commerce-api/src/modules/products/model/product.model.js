import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // sku → unique identifier for inventory/product tracking.
    // SKU = Stock Keeping Unit — a unique code used internally to identify and track a specific product/variant in inventory.
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    productImages: [
      {
        type: String,
        trim: true,
      },
    ],

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "OUT_OF_STOCK"],
      default: "ACTIVE",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// check uniqueness
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ brand: 1 });

export const Product = model("Product", productSchema);
