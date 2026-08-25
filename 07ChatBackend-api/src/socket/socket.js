import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middleware/socketAuth.middleware.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
    },
  });

  //   What does io.use() mean? It's Socket.IO's middleware registration.It means:("Before allowing a socket connection to reach connection, run this middleware.");
  io.use(socketAuthMiddleware);

  //   means: "Whenever a client successfully connects to our Socket.IO server, run this function."
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    //   It fires when the connection is lost
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });   

  return io;
};

//new Server(server) - creates the Socket.IO server and attaches it to our existing HTTP server.

// HTTP Server
//      │
//      ├── Express → REST API
//      │
//      └── Socket.IO → Real-time communication
