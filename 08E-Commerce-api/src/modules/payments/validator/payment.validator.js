import { ApiError } from "../../../utils/ApiError.js";
import { validateRequired } from "../../../utils/validateRequired.js";
import { validateObjectId } from "../../../utils/validateObjectId.js";

const validateQueryParams = (queryData) => {
  const { page, limit, status } = queryData;

  const normalizedPage = Number(page) || 1;
  const normalizedLimit = Number(limit) || 10;
  const normalizedStatus =
    status !== undefined ? status.trim().toUpperCase() : undefined;

  if (normalizedPage !== undefined) {
    if (
      !Number.isInteger(normalizedLimit) ||
      !Number.isFinite(normalizedLimit) ||
      normalizedPage < 1
    ) {
      throw new ApiError(400, "Enter positive finite page value");
    }
  }

  if (normalizedLimit !== undefined) {
    if (
      !Number.isInteger(normalizedLimit) ||
      !Number.isFinite(normalizedLimit) ||
      normalizedPage < 1
    ) {
      throw new ApiError(400, "Enter positive finite limit value");
    }
  }

  if (normalizedStatus !== undefined) {
    if (
      !["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"].includes(normalizedStatus)
    ) {
      throw new ApiError(400, "Invalid status value");
    }
  }

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    status: normalizedStatus,
  };
};


export {validateQueryParams}