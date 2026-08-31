import { ApiError } from "./ApiError.js";

const validateNotFound = (entity) => {
  if (!entity) {
    throw new ApiError(404, `${entity} not found`);
  }
};

export { validateNotFound };
