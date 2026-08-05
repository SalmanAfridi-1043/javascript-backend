import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  // get token from Authorization header or cookies
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");
  // above checks the case insensativeness

  if (!token) {
    throw new ApiError(401, "Unauthorized - No token provided");
  }

  // verify token
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  if (!decoded?.userId) {
    throw new ApiError(401, "Unauthorized - Invalid token");
  }

  // find user
  const user = await User.findById(decoded.userId).select(
    "-password -refreshToken",
  );

  if (!user) {
    throw new ApiError(401, "Unauthorized - User not found");
  }

  req.user = user;
  next();
});

export { authMiddleware };
