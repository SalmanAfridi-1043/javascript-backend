import mongoose, { Schema, model } from "mongoose";

const likeSchema = new Schema(
  {
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
  },
  { timestamps: true },
);

// Compound unique index
likeSchema.index({ user: 1, post: 1 }, { unique: true });

export const Like = model("Like", likeSchema);
