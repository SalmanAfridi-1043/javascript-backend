// it means that first the root .env will load then this one
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { ApiError } from "../utils/ApiError.js";

const requiredEnv = ["MONGODB_URL", "CORS_ORIGIN"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new ApiError(404, `Missing required environment variable: ${key}`);
  }
}

export default {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URL,
  corsOrigin: process.env.CORS_ORIGIN,
};

// Now environment variables have one central entry point. we can use this poin to access our .env variables everywhere in the project
