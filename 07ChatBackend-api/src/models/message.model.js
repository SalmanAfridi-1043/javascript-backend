import mongoose, { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    // This should come from the authenticated user
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["TEXT"], // This prevents invalid values like "VIDEO" or "random" from accidentally entering the database.
      default: "TEXT",
    },

    // Stores users who have read the message
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    deliveredTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    editedAt: {
      type: Date,
    },
  },

  { timestamps: true },
);

messageSchema.index({ conversation: 1, createdAt: -1 });

export const Message = model("Message", messageSchema);
