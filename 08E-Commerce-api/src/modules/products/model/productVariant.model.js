import { Schema, model } from "mongoose";

const productVariantSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // sku → unique identifier for inventory/product tracking.
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // it'll store key:value pair (JS Map()). it'll help to store product properties like
    //attributes: {              attributes: {
    //   size: "L",                 storage: "256GB",
    //   color: "Black",}           color: "Blue",}
    attributes: {
      type: Map,
      of: String,
      required: true,
    },

    price: {
      type: Number,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// product will be unique. coz it ll represent one product record at a time
productVariantSchema.index({ product: 1 });

export const ProductVariant = model("ProductVariant", productVariantSchema);

// we have tow models. one is for products details like brand,quantity,stock, price. while this one is for the product properties nad variants. that represents individual product
