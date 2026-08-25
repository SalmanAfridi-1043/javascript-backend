import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middleware/socketAuth.middleware.js";
import { Conversation } from "../models/conversation.model.js";
import { ApiError } from "../utils/ApiError.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
    },
  });

  // Socket authentication middleware
  io.use(socketAuthMiddleware);

  // Runs whenever a client successfully connects
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a conversation room
    socket.on("conversation:join", async (conversationId) => {
      try {
        // Find conversation
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          throw new ApiError(404, "Conversation not found");
        }

        // Check whether authenticated user is a participant
        const isParticipant = conversation.participants.some(
          (participant) =>
            participant.toString() === socket.user._id.toString(),
        );

        if (!isParticipant) {
          throw new ApiError(
            403,
            "You are not authorized to join this conversation",
          );
        }

        // Join conversation room
        const roomName = `conversation:${conversationId}`;

        await socket.join(roomName);

        console.log(`${socket.user.username} joined ${roomName}`);
      } catch (error) {
        console.error(`Failed to join conversation: ${error.message}`);

        // For Socket.IO events, we don't have Express's (res.status(...).json(...))
        // Instead, we can send an event back to the client:

        // Send error back to this socket
        socket.emit("conversation:error", {
          statusCode: error.statusCode || 500,
          message: error.message || "Failed to join conversation",
        });
      }
    });

    // Fires when this socket disconnects
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
