import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "./config/database.config.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

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
