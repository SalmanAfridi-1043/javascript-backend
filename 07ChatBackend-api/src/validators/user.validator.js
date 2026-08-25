import { ApiError } from "../utils/ApiError.js";

const validateSearchData = (searchData) => {
  const { search, page, limit } = searchData;

  const normalizedSearch = search?.trim();
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
    search: normalizedSearch,
    page: normalizedPage,
    limit: normalizedLimit,
  };
};

export { validateSearchData };
