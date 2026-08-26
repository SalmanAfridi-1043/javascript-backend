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

// io represents the entire Socket.IO server.(io = whole Socket.IO system)
// socket represents one specific connection/device.

// emit() means simply:"Send/trigger this event."It can be used for messages, errors, typing, read receipts, notifications, etc.

// | Code                     | Who receives it?                   |
// | ------------------------ | ---------------------------------- |
// | `socket.emit()`          | Only this socket/device/connection |
// | `io.emit()`              | Everyone                           |
// | `io.to(room).emit()`     | Everyone in room                   |
// | `socket.to(room).emit()` | Everyone in room **except me**     |
// | `io.on("connection")`    | Listen for new connections         |
// | `socket.on()`            | Listen for an event                |
// | `socket.join(room)`      | Put socket into room               |

// emit()= SEND an event
// on()= LISTEN for an event

// Your server determines the destination using:
// socket.emit()              // this client
// io.emit()                  // everyone
// io.to(room).emit()         // room
// socket.to(room).emit()     // room except sender

// So there is no conflict because:
// socket.id   → identifies the connection
// room ID     → identifies the conversation
// user ID     → identifies the account
// message ID  → identifies the message

// userId-→ identifies the account
// socket.id-→ identifies one active connection/device/socket

// One user can have multiple connections/sockets/devices (like whtsap linked devices):
// userId: Salman
// ├── socket A → laptop
// ├── socket B → phone
// └── socket C → browser

// A room is a virtual medium in whcih different devices/socket communicates
// Rooms are temporary-A room exists only while sockets are connected and joined.
// If a user disconnects:-> socket disconnects ->socket leaves room
// But the conversation and messages remain in MongoDB.
