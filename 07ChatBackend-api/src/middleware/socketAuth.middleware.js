// The important difference is that Socket.IO middleware runs when the socket is trying to connect, before your connection handler executes.

import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const { token } = socket.handshake.auth;

    //   In Socket.IO middleware, authentication failure should call next(error) rather than throwing an ApiError.
    if (!token) {
      return next(new ApiError(401, "Authentication token is required"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded || !decoded?.userId) {
      throw new ApiError(401, "Unauthorized - Invalid token");
    }

    // find user
    const user = await User.findById(decoded.userId).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new ApiError(401, "Unauthorized - User not found");
    }

    socket.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
