import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config();

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error :", error);
    });

    app.listen(port, () => {
      console.log("\nServer is listening on port ", port);
    });
  })
  .catch((error) => {
    console.log("MongoBD connection failed : ", error);
  });
