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

export { createUrlService };
