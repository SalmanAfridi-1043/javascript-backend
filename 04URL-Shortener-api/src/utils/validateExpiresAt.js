import { ApiError } from "./ApiError.js";

const validateExpiresAt = (expiresAt) => {
  if (!expiresAt) return;

  const expiryDate = new Date(expiresAt);
  const currentDate = new Date();

  if (isNaN(expiryDate.getTime())) {
    throw new ApiError(400, "Invalid expiration date");
  }

  // if its already expired
  if (expiryDate <= currentDate) {
    throw new ApiError(400, "Expiration date must be in the future");
  }

  return expiryDate;
};

export { validateExpiresAt };
