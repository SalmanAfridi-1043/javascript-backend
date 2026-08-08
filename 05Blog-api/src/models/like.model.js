import mongoose, { Schema, model } from "mongoose";

const likeSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  { timestamps: true },
);

// Compound unique index
likeSchema.index({ user: 1, post: 1 }, { unique: true });

export const Like = model("Like", likeSchema);
