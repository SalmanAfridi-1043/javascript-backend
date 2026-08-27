import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middleware/socketAuth.middleware.js";
import { Conversation } from "../models/conversation.model.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

import {
  sendMessageService,
  markMessageDeliveredService,
  markMessageReadService,
  editMessageService,
} from "../services/message.service.js";

const initializeSocket = (server) => {
  const userSockets = new Map(); // A JavaScript Map stores key → value pairs(userId → Set of socket IDs).

  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
    },
  });

  // Socket authentication middleware
  io.use(socketAuthMiddleware);

  // USER CONNECTION HANDLER
  // Runs whenever a client successfully connects
  io.on("connection", async (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    const userId = socket.user._id.toString();

    // if no set/socket for user then create it
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set()); //Why a Set?: Because one user can have multiple connections, and a Set conveniently stores unique socket IDs.
    }

    // then get user existing/new socket and add this current socket as well
    userSockets.get(userId).add(socket.id);

    // size===1. means if there is even one (if this is the first socket/user) socket, then still user is online
    if (userSockets.get(userId).size === 1) {
      // using try/catch to handle the DB error if connection fails
      try {
        await User.findByIdAndUpdate(userId, {
          $set: { isOnline: true },
        });

        // create custom event to represent user status to others
        // let all connected members to know that user is online (used to reflect in UI)
        io.emit("user:online", { userId });
      } catch (error) {
        console.error(
          `Failed to update online status for ${userId}:`,
          error.message,
        );
      }
    }

    // Start Typing indicator
    // user can type only in its conversation/room so first authenticate the user room
    socket.on("typing:start", async ({ conversationId }) => {
      try {
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.user._id,
        });

        if (!conversation) {
          throw new ApiError(
            403,
            "You are not authorized to access this conversation",
          );
        }

        const roomName = `conversation:${conversationId}`;

        // Send to everyone in the room except the socket/user that triggered the event.
        socket.to(roomName).emit("typing:start", {
          userId: socket.user._id,
          conversationId,
        });
      } catch (error) {
        socket.emit("typing:error", {
          statusCode: error.statusCode || 500,
          message: error.message || "Failed to start typing indicator",
        });
      }
    });

    // Stop Typing indicator
    socket.on("typing:stop", async ({ conversationId }) => {
      try {
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.user._id,
        });

        if (!conversation) {
          throw new ApiError(
            403,
            "You are not authorized to access this conversation",
          );
        }

        const roomName = `conversation:${conversationId}`;

        // Send to everyone in the room except the socket/user that triggered the event.
        socket.to(roomName).emit("typing:stop", {
          userId: socket.user._id,
          conversationId,
        });
      } catch (error) {
        socket.emit("typing:error", {
          statusCode: error.statusCode || 500,
          message: error.message || "Failed to stop typing indicator",
        });
      }
    });

    // MESSAGE DELIVERY HANDLER (event whcih handle message delivery)
    // it will fire auto when the user/reciever recieved it (reciever aknowledge the server that i got the message)
    socket.on("message:delivered", async ({ messageId }) => {
      try {
        const deliveredMessage = await markMessageDeliveredService({
          messageId,
          receiverId: socket.user._id, // its the deliveredTo/reciever user id
        });

        // get sender id
        const senderId = deliveredMessage.sender.toString();

        // get all sockets for this sender/user (like laptop phone etc)
        const senderSockets = userSockets.get(senderId);

        // if any socket exists then
        if (senderSockets) {
          senderSockets.forEach((socketId) => {
            // give aknowledgement to all sockets (laptop,phone)
            io.to(socketId).emit("message:delivered", {
              messageId: deliveredMessage._id,
              deliveredBy: socket.user._id,
            });
          });
        }
      } catch (error) {
        socket.emit("message:error", {
          statusCode: error.statusCode || 500,
          message: error.message || "Failed to mark message as delivered",
        });
      }
    });

    // MESSAGE READBY HANDLER (event whcih handle message readibility)
    socket.on("message:read", async ({ messageId }) => {
      try {
        const readMessage = await markMessageReadService({
          messageId,
          readerId: socket.user._id, //the user who actually read the message.
        });

        const senderId = readMessage.sender.toString();
        const senderSockets = userSockets.get(senderId);

        if (senderSockets) {
          senderSockets.forEach((socketId) => {
            io.to(socketId).emit("message:read", {
              messageId: readMessage._id,
              readBy: socket.user._id,
            });
          });
        }
      } catch (error) {
        socket.emit("message:error", {
          statusCode: error.statusCode || 500,
          message: error.message || "Failed to mark message as read",
        });
      }
    });

    // MESSAGE EDIT HANDLER
    // Edit an existing/sent message
    socket.on("message:edit", async (data) => {
      try {
        const { messageId, content } = data;

        const updatedMessage = await editMessageService({
          messageId,
          content,
          senderId: socket.user._id,
        });

        const senderId = updatedMessage.sender.toString();
        const senderSockets = userSockets.get(senderId);

        if (senderSockets) {
          senderSockets.forEach((socketId) => {
            io.to(socketId).emit("message:updated", {
              messageId: updatedMessage._id,
              content: updatedMessage.content,
              editedAt: updatedMessage.editedAt,
            });
          });
        }
      } catch (error) {
        console.error(`Failed to edit message: ${error.message}`);
        socket.emit("message:error", {
          statusCode: error.statusCode || 500,
          message: error.message || "Failed to edit message",
        });
      }
    });

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

    // MESSAGE SENDER/HANDLER
    // Send a new message (server create and send message to reciever)
    socket.on("message:send", async (data) => {
      try {
        const { conversationId, content } = data;

        const message = await sendMessageService({
          conversationId,
          content,
          senderId: socket.user._id,
        });

        // create a new room for this conversation
        const roomName = `conversation:${conversationId}`;

        // pass the message to that new room (trigger the new message event in that new room)
        io.to(roomName).emit("message:new", message);
      } catch (error) {
        console.error(`Failed to send message: ${error.message}`);

        socket.emit("message:error", {
          statusCode: error.statusCode || 500,
          message: error.message || "Failed to send message",
        });
      }
    });

    // USER DISCONNECT HANDLER
    // Fires when this socket disconnects
    socket.on("disconnect", async () => {
      const userId = socket.user._id.toString();

      const sockets = userSockets.get(userId);

      // if there are no socket to delete then return
      if (!sockets) {
        return;
      }

      // delete the current disconnected socket from Map()/set
      sockets.delete(socket.id);

      // if User has no active connections/sockets anymore then delete the user
      // (No socket = user is offline)

      if (sockets.size === 0) {
        userSockets.delete(userId);

        // using try/catch to handle DB error
        try {
          const lastSeen = new Date();

          await User.findByIdAndUpdate(userId, {
            $set: {
              isOnline: false,
              lastSeen,
            },
          });

          // custom event to show user status when offline
          // This tells all connected clients:This user is now offline.
          io.emit("user:offline", {
            userId,
            lastSeen,
          });
        } catch (error) {
          console.error(
            `Failed to update offline status for ${userId}:`,
            error.message,
          );
        }
      }

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export { initializeSocket };

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
// Room = WHERE while Event = WHAT

// The important terms
// | Term                | What it is                                             | Direction       |
// | ------------------- | ------------------------------------------------------ | --------------- |
// | `conversation:123`  | **Room name** for conversation ID `123`                | Server-side     |
// | `conversation:join` | Event asking server to join a conversation room        | Client → Server |
// | `message:send`      | Event asking server to send/save a message             | Client → Server |
// | `message:new`       | Event notifying clients that a new message was created | Server → Client |
// | `message:error`     | Event sending a message-related error                  | Server → Client |
// | `disconnect`        | Built-in Socket.IO event when a socket disconnects     | Socket.IO       |

// io.to("conversation:123").emit("message:new", message) so ,
//it means: In conversation 123, announce that a new message exists.

// One architectural rule to remember
// 1. Socket layer = communication.
// 2. Service layer = business logic.

// Important distinction
// MongoDB stores the persistent status:
// isOnline
// lastSeen

// Socket.IO delivers the real-time notification:
// user:online
// user:offline

// So:Database = source of stored state; Socket.IO = real-time state notification.

// Important distinction
// message:new -→ Server tells recipient: "Here is a new message."
// message:delivered -→ Recipient tells server: "I received it." (aknowledgement to server)
