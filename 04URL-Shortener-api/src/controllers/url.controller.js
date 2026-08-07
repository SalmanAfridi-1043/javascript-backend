import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createUrlService } from "../services/url.service.js";

const createUrl = asyncHandler(async (req, res, next) => {
  const { originalUrl, expiresAt } = req.body;
  const userId = req.user?._id;

  const createdUrl = await createUrlService(originalUrl, expiresAt, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, createdUrl, "URL code created successfully"));
});

export { createUrl };
