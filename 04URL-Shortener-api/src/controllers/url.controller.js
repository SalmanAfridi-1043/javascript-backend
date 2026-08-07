import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createUrlService,
  redirectToOriginalUrlService,
} from "../services/url.service.js";

const createUrl = asyncHandler(async (req, res, next) => {
  const { originalUrl, expiresAt } = req.body;
  const userId = req.user?._id;

  const createdUrl = await createUrlService(originalUrl, expiresAt, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, createdUrl, "URL code created successfully"));
});

const redirectToOriginalUrl = asyncHandler(async (req, res, next) => {
  const { shortCode } = req.params;

  const originalUrl = await redirectToOriginalUrlService(shortCode);

  return res.redirect(302, originalUrl);
});

export { createUrl };
