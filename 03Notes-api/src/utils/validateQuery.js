import { ApiError } from "./ApiError.js";

const validateQuery = ({
  page,
  limit,
  sortBy,
  order,
  favorite,
  archived,
  search,
}) => {
  // defaults + conversion

  page = Number(page) || 1;

  limit = Number(limit) || 10;

  sortBy = sortBy || "createdAt";

  order = order || "desc";

  // validate pagination

  if (page < 1) {
    throw new ApiError(400, "Invalid page value");
  }

  if (limit < 1 || limit > 100) {
    throw new ApiError(400, "Invalid limit value");
  }

  // validate sorting

  const allowedSortFields = ["createdAt", "title"];

  if (!allowedSortFields.includes(sortBy)) {
    throw new ApiError(400, "Invalid sort field");
  }

  if (!["asc", "desc"].includes(order)) {
    throw new ApiError(400, "Invalid order value");
  }

  // boolean conversion

  favorite =
    favorite === "true" ? true : favorite === "false" ? false : undefined;

  archived =
    archived === "true" ? true : archived === "false" ? false : undefined;

  // search cleanup
  search = search?.trim() || undefined;

  return {
    page,
    limit,
    sortBy,
    order,
    favorite,
    archived,
    search,
  };
};

export { validateQuery };
