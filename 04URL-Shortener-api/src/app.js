import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";

// routes import
import userRouter from "./routes/user.routes.js";
import urlRouter from "./routes/url.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(express.static("public"));
app.use(cookieParser());

// routes declaration
app.use("/api/v1/user", userRouter);
app.use("/api/v1/url", urlRouter);

//Showing running message on /
app.get("/", (req, res) => {
  res.json({ message: "URL Shortner API is running" });
});

app.use(errorHandler);

export default app;
