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
      trim: true,
    },

    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export const User = model("User", userSchema);
