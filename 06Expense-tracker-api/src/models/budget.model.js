import mongoose, { Schema, model } from "mongoose";

const budgetSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    amount: {
      type: Number,
      min: 0.01,
      required: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export const Budget = model("Budget", budgetSchema);
