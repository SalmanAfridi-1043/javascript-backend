import { Schema, model } from "mongoose";

const inventoryTransactionSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variant: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
    },

    type: {
      type: String,
      enum: ["INITIAL_STOCK", "RESTOCK", "SALE", "RETURN", "ADJUSTMENT"],
      required: true,
      uppercase: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    previousStock: {
      type: Number,
      required: true,
      min: 0,
    },

    newStock: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      trim: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },

    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

inventoryTransactionSchema.index({ product: 1, createdAt: -1 });
inventoryTransactionSchema.index({ variant: 1, createdAt: -1 });
inventoryTransactionSchema.index({ type: 1 });

export const InventoryTransaction = model(
  "InventoryTransaction",
  inventoryTransactionSchema,
);

// This is the history/audit trail of stock changes.

// Example:
// Initial Stock  +50
// Sale           -5
// Restock        +20
// Return         +2
// Adjustment     -1

// It lets us know why and when inventory changed, instead of only knowing the current stock.
