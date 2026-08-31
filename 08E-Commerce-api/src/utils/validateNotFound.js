import { ApiError } from "./ApiError.js";

const validateNotFound = (field, value) => {
  if (!field) {
    throw new ApiError(404, `${value} not found`);
  }
};

export { validateNotFound };
