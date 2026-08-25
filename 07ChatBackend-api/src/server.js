import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import http from "http";

import connectDB from "./config/db.config.js";
import app from "./app.js";
import { initializeSocket } from "./socket/socket.js";

const PORT = process.env.PORT || 3000;

// Previously Express created the HTTP server internally.(app.listen() ...)
// Now we create the HTTP server ourselves, because Socket.IO needs to attach to that server ( server.listen(PORT)...) for realtime communication.

// http.createServer(app) doesn't replace Express.It wraps your Express app inside a Node HTTP server:
const server = http.createServer(app);

const io = initializeSocket(server);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  });
