import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createUrlService,
  deleteUrlByIdService,
  getUrlAnalyticsService,
  getUrlByIdService,
  getUserUrlsService,
  redirectToOriginalUrlService,
  updateUrlByIdService,
} from "../services/url.service.js";

const createUrl = asyncHandler(async (req, res, next) => {
  const { originalUrl, expiresAt, customCode } = req.body;
  const userId = req.user?._id;

  const createdUrl = await createUrlService(
    originalUrl,
    expiresAt,
    userId,
    customCode,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, createdUrl, "URL code created successfully"));
});

const redirectToOriginalUrl = asyncHandler(async (req, res, next) => {
  const { shortCode } = req.params;

  const originalUrl = await redirectToOriginalUrlService(shortCode);

  return res.redirect(302, originalUrl);
});

const getUserUrls = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  const allUrls = await getUserUrlsService(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, allUrls, "All URLs fetched successfully"));
});

const getUrlById = asyncHandler(async (req, res, next) => {
  // const urlId = req.params?.urlId; // both are ok
  const { urlId } = req.params;
  const userId = req.user?._id;

  const fetchedUrl = await getUrlByIdService(urlId, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, fetchedUrl, "URL fetched successfully"));
});

const deleteUrlById = asyncHandler(async (req, res, next) => {
  const { urlId } = req.params;
  const userId = req.user?._id;

  const response = await deleteUrlByIdService(urlId, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "URL deleted successfully"));
});

const updateUrlById = asyncHandler(async (req, res, next) => {
  const { urlId } = req.params;
  const userId = req.user?._id;
  const data = req.body;

  const updatedUrl = await updateUrlByIdService(urlId, userId, data);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUrl, "URL updated successfully"));
});

const getUrlAnalytics = asyncHandler(async (req, res, next) => {
  const { urlId } = req.params;
  const userId = req.user?._id;

  const urlAnalytics = await getUrlAnalyticsService(urlId, userId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, urlAnalytics, "URL analytics fetched successfully"),
    );
});

export {
  createUrl,
  redirectToOriginalUrl,
  getUserUrls,
  getUrlById,
  deleteUrlById,
  updateUrlById,
  getUrlAnalytics,
};
