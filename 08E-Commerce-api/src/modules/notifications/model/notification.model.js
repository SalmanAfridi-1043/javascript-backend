import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "ORDER_CONFIRMED",
        "PAYMENT_SUCCESS",
        "ORDER_SHIPPED",
        "ORDER_DELIVERED",
        "ORDER_CANCELLED",
        "LOW_STOCK",
        "SYSTEM",
      ],
      required: true,
      uppercase: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    // relatedOrder: optionally connects a notification to a specific order, so clicking something like “Your order has shipped” can lead directly to that order.
    relatedOrder: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = model("Notification", notificationSchema);
