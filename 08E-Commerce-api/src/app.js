import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";
import env from "./config/env.config.js";
import routes from "./routes/index.routes.js";
import morgan from "morgan";
import mongoose from "mongoose";
import helmet from "helmet";
import { apiLimiter } from "./middleware/rateLimit.middleware.js";
import { requestId } from "./middleware/requestId.middleware.js";

const app = express();

// requestId gives every incoming request a unique ID.It helps us trace/debug a specific request across logs and errors.
app.use(requestId);

// Morgan is HTTP request logging middleware. it shows requests like `GET /health 200` in the terminal, making debugging and API monitoring easier.
app.use(morgan("dev"));

// Helmet automatically adds several security-related HTTP headers, reducing common web security risks.
app.use(helmet());

app.use(
  cors({
    origin: env.corsOrigin,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // a temp place for image to be stored
app.use(cookieParser());

// all routes are mounted to this file
// it also limit the routes from excessiveness/in large quantity
app.use("/api/v1", apiLimiter, routes);

//Showing running message on /
app.get("/", (req, res) => {
  res.json({ message: "ECommerce-API is running" });
});

// it tells that both API is running and mongodb is connected/disconnected
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1;

  res.status(dbStatus ? 200 : 503).json({
    success: dbStatus,
    message: dbStatus
      ? "ECommerce API is healthy"
      : "Database connection unavailable",
    database: dbStatus ? "connected" : "disconnected",
  });
});

// 404 handler (if url is invalid and not match the above one's then 404 error)
// It gives every unknown endpoint a consistent response and keeps the global error handler for actual application errors.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorHandler);

export default app;
