import { ApiError } from "../utils/ApiError.js";
import { Url } from "../models/url.model.js";
import bcrypt from "bcrypt";
import { createSafeUser } from "../utils/sanitizeUser.js";
import jwt, { decode } from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import { generateShortCode } from "../utils/generateShortCode.js";

const createUrlService = async (originalUrl, expiresAt, userId) => {
  if (!originalUrl?.trim()) {
    throw new ApiError(400, "URL is required");
  }

  try {
    new URL(originalUrl);
  } catch (error) {
    throw new ApiError(400, "Invalid URL");
  }

  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  let code;
  do {
    code = generateShortCode();
  } while (await Url.exists({ shortCode: code }));

  const createUrl = await Url.create({
    originalUrl: originalUrl?.trim(),
    shortCode: code,
    owner: userId,
    expiresAt: expiresAt ?? null,
  });

  return {
    originalUrl: createUrl.originalUrl,
    shortCode: createUrl.shortCode,
    expiresAt: createUrl.expiresAt,
    createdAt: createUrl.createdAt,
  };
};

const redirectToOriginalUrlService = async (shortCode) => {
  if (!shortCode) {
    throw new ApiError(400, "Short Code is required");
  }

  const urlDocument = await Url.findOne({ shortCode });

  if (!urlDocument) {
    throw new ApiError(404, "Original URL not found");
  }

  if (urlDocument.expiresAt) {
    if (new Date.now() > urlDocument.expiresAt) {
      throw new ApiError(410, "URL expired");
    }
  }

  //    better approach
  //   if (urlDocument.expiresAt && new Date() > urlDocument.expiresAt) {
  //     throw new ApiError(410, "URL expired");
  //   }

  urlDocument.clicks += 1;
  urlDocument.lastVisited = new Date();

  await urlDocument.save();

  return { originalUrl: urlDocument.originalUrl };
};

const getUserUrlsService = async (userId) => {
  if (!userId) {
    throw new ApiError(401, "Unauthorized access");
  }

  const allUrlsDocument = await Url.find({
    owner: userId,
  }).sort({ createdAt: -1 });

  if (allUrlsDocument.length === 0) {
    throw new ApiError(404, "No URL found");
  }

  return allUrlsDocument.map((document) => ({
    originalUrl: document.originalUrl,
    shortCode: document.shortCode,
    clicks: document.clicks,
    createdAt: document.createdAt,
  }));
};

export { createUrlService, redirectToOriginalUrlService, getUserUrlsService };
