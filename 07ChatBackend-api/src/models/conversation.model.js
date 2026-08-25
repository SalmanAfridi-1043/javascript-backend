import mongoose, { Schema, model } from "mongoose";

const conversationSchema = new Schema(
  {
    // type means conversaiton type like direct or group wise
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },

    name: {
      type: String,
    },

    // will contain all conversation members(like current user + target user)
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // it represents the group admin
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // stores the latest message for quick conversation previews
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true },
);

conversationSchema.index({ type: 1, participants: 1 });

export const Conversation = model("Conversation", conversationSchema);
