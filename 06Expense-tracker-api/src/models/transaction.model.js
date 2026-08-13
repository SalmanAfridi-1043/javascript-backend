import mongoose, { Schema, model } from "mongoose";

const transactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "bank", "card", "wallet"],
    },

    date: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    //recurring: tells whether the transaction repeats automatically. Example: monthly rent → true.
    recurring: {
      type: Boolean,
      default: false,
    },

    // frequency: tells how often transaction repeats. Example: "monthly", "weekly", etc.
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
    },
  },
  { timestamps: true },
);

export const Transaction = model("Transaction", transactionSchema);
