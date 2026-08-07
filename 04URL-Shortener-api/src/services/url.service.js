import { ApiError } from "../utils/ApiError.js";
import { Url } from "../models/url.model.js";
import bcrypt from "bcrypt";
import { createSafeUser } from "../utils/sanitizeUser.js";
import jwt, { decode } from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import { generateShortCode } from "../utils/generateShortCode.js";
import { validateRequired } from "../utils/validateRequired.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import { validateExpiresAt } from "../utils/validateExpiresAt.js";

const createUrlService = async (originalUrl, expiresAt, userId, customCode) => {
  const normalizedOriginalUrl = originalUrl?.trim();
  const normalizedCustomCode = customCode?.trim();

  validateRequired(normalizedOriginalUrl, "URL");

  try {
    new URL(normalizedOriginalUrl);
  } catch (error) {
    throw new ApiError(400, "Invalid URL");
  }

  validateRequired(userId, "user id");

  validateExpiresAt(expiresAt);

  // check if the original url and its code already exists to avoid duplication
  const existingUrl = await Url.findOne({
    originalUrl: normalizedOriginalUrl,
    owner: userId,
  });
  if (existingUrl) return existingUrl;

  let code;
  const customCodeRegex = /^[a-zA-Z0-9_-]+$/; //to follow specific pattern

  if (normalizedCustomCode) {
    if (!customCodeRegex.test(normalizedCustomCode)) {
      throw new ApiError(400, "Only (a-z,A-Z,0-9,_,-) are acceptable");
    }

    if (normalizedCustomCode.length < 3 || normalizedCustomCode.length > 15) {
      throw new ApiError(400, "Custom code must be 3-15 characters long");
    }

    if (await Url.exists({ shortCode: normalizedCustomCode })) {
      throw new ApiError(409, "Custom code already exists");
    }

    code = normalizedCustomCode;
  } else {
    do {
      code = generateShortCode();
    } while (await Url.exists({ shortCode: code }));
  }

  const createUrl = await Url.create({
    originalUrl: normalizedOriginalUrl,
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
  validateRequired(shortCode, "Short Code");

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
  validateRequired(userId, "user id");

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

const getUrlByIdService = async (urlId, userId) => {
  validateRequired(urlId, "URL Id");
  validateRequired(userId, "user Id");
  validateObjectId(urlId, "URL");

  const urlDocument = await Url.findOne({
    _id: urlId,
    owner: userId,
  });

  if (!urlDocument) {
    throw new ApiError(404, "URL not found");
  }

  return {
    originalUrl: urlDocument.originalUrl,
    shortCode: urlDocument.shortCode,
    clicks: urlDocument.clicks,
    lastVisited: urlDocument.lastVisited,
    createdAt: urlDocument.createdAt,
  };
};

const deleteUrlByIdService = async (urlId, userId) => {
  validateRequired(urlId, "URL Id");
  validateRequired(userId, "user Id");
  validateObjectId(urlId, "URL");

  const urlDocument = await Url.findOneAndDelete({
    _id: urlId,
    owner: userId,
  });

  if (!urlDocument) {
    throw new ApiError(404, "URL not found");
  }

  return {
    originalUrl: urlDocument.originalUrl,
    shortCode: urlDocument.shortCode,
  };
};

const updateUrlByIdService = async (urlId, userId, data) => {
  const { originalUrl, expiresAt } = data;

  const normalizedOriginalUrl = originalUrl?.trim() || null;
  const normalizedExpiresAt = expiresAt?.trim() || null;

  validateRequired(urlId, "URL Id");
  validateRequired(userId, "user Id");
  validateObjectId(urlId, "URL");

  validateExpiresAt(normalizedExpiresAt);

  const updatedUrlDocument = await Url.findOne({
    _id: urlId,
    owner: userId,
  });

  if (!updatedUrlDocument) {
    throw new ApiError(404, "URL not found");
  }

  if (normalizedOriginalUrl) {
    updatedUrlDocument.originalUrl = normalizedOriginalUrl;
  }
  if (normalizedExpiresAt) {
    updatedUrlDocument.expiresAt = normalizedExpiresAt;
  }

  await updatedUrlDocument.save();

  return {
    originalUrl: updatedUrlDocument.originalUrl,
    expiresAt: updatedUrlDocument.expiresAt,
    updatedAt: updatedUrlDocument.updatedAt,
  };
};

const getUrlAnalyticsService = async (urlId, userId) => {
  validateRequired(urlId, "URL Id");
  validateRequired(userId, "user Id");
  validateObjectId(urlId, "URL");

  const urlDocument = await Url.findOne({
    _id: urlId,
    owner: userId,
  });

  if (!urlDocument) {
    throw new ApiError(404, "URL not found");
  }

  return {
    originalUrl: urlDocument.originalUrl,
    shortCode: urlDocument.shortCode,
    clicks: urlDocument.clicks,
    lastVisited: urlDocument.lastVisited,
    expiresAt: urlDocument.expiresAt,
    createdAt: urlDocument.createdAt,
  };
};

export {
  createUrlService,
  redirectToOriginalUrlService,
  getUserUrlsService,
  getUrlByIdService,
  deleteUrlByIdService,
  updateUrlByIdService,
  getUrlAnalyticsService,
};
