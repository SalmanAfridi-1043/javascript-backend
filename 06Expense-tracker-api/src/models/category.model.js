import mongoose, { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export const Category = model("Category", categorySchema);
