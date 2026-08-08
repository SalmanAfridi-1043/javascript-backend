import { isValidObjectId } from "mongoose";
import { ApiError } from "./ApiError.js";

const validateObjectId = (id, fieldName) => {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${fieldName} id`);
  }
};

export { validateObjectId };
