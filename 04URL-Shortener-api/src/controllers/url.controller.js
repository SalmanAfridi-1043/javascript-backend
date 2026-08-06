import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createUrlService } from "../services/url.service.js";

const createUrl = asyncHandler(async (req, res, next) => {
  const { originalUrl } = req.body;
  const userId = req.user?._id;

  const createdUrl = await createUrlService(originalUrl, userId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, createdUrl, "New short URL created successfully"),
    );
});

export { createUrl };
