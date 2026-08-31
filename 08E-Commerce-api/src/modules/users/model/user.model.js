import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["CUSTOMER", "ADMIN"],
      default: "CUSTOMER",
    },

    avatar: {
      type: String,
    },

    // isActive will be used for soft delete so that the user entry remain in DB
    // because we may need the user's historical:Orders,Payments,Reviews,etc
    isActive: {
      type: Boolean,
      default: true,
    },

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

export const User = model("User", userSchema);
