import { validateObjectId } from "../utils/validateObjectId.js";

const validateParticipantIds = (ids, fieldName = "IDs") => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, `${fieldName} must be a non-empty array`);
  }

  ids.forEach((id) => {
    validateObjectId(id, fieldName);
  });
};

const validatePaginationData = (paginationData) => {
  const { page, limit } = paginationData;

  const normalizedPage = Number(page) || 1;
  const normalizedLimit = Number(limit) || 10;

  if (
    (normalizedPage && !Number.isFinite(normalizedPage)) ||
    !Number.isInteger(normalizedPage) ||
    normalizedPage < 1
  ) {
    throw new ApiError(400, "Enter valid positive page number");
  }

  if (
    (normalizedLimit && !Number.isFinite(normalizedLimit)) ||
    !Number.isInteger(normalizedLimit) ||
    normalizedLimit < 1
  ) {
    throw new ApiError(400, "Enter valid positive limit number");
  }

  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
};

export { validateParticipantIds, validatePaginationData };
