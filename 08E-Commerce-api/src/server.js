import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "./config/database.config.js";
import app from "./app.js";
import env from "./config/env.config.js";

const PORT = env.port;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  });
