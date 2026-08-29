import { Schema, model } from "mongoose";

const addressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    label: {
      type: String,
      enum: ["HOME", "OFFICE", "OTHER"],
      default: "HOME",
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: "Pakistan",
    },

    // isDefault lets a user designate/specify one address as their default checkout/shipping address.
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// one unique user for address
addressSchema.index({ user: 1 });

export const Address = model("Address", addressSchema);

//  The service logic will later ensure a user doesn't accidentally have multiple defaults.
