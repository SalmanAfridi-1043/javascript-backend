import { Schema, model } from "mongoose";

const orderStatusHistorySchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "RETURN_REQUESTED",
        "RETURNED",
      ],
      required: true,
    },

    note: {
      type: String,
      trim: true,
    },

    // changedBy: it can identify the admin/user who changed the status. For automatic changes, it can remain empty.
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// each order has its own status histroy
orderStatusHistorySchema.index({ order: 1, createdAt: -1 });

export const OrderStatusHistory = model(
  "OrderStatusHistory",
  orderStatusHistorySchema,
);

// Purpose: keeps the complete timeline of an order:
// PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
