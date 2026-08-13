import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";

// routes import
import authRouter from "./routes/auth.routes.js";
import transactionRouter from "./routes/transaction.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/transactions", transactionRouter);

//Showing running message on /
app.get("/", (req, res) => {
  res.json({ message: "ExpenseTracker-API is running" });
});

app.use(errorHandler);

export default app;
