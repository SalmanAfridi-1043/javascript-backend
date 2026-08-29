import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";

// routes import

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // a temp place for image to be stored
app.use(cookieParser());

// routes declaration

//Showing running message on /
app.get("/", (req, res) => {
  res.json({ message: "ECommerce-API is running" });
});

app.use(errorHandler);

export default app;
