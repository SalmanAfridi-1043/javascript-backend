import mongoose, { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    // who reviece notification
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // who send/caused the notification
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["like", "comment", "follow"],
      required: true,
    },

    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },

    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },

    // is notification read or unread
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Notification = model("Notification", notificationSchema);
