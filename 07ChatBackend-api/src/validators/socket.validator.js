import { ApiError } from "../utils/ApiError.js";

const validateSocketPayload = (payload, requiredFields) => {
  if (!payload || typeof payload !== "object") {
    throw new ApiError(400, "Invalid socket payload");
  }

  for (const field of requiredFields) {
    if (
      payload[field] === undefined ||
      payload[field] === null ||
      (typeof payload[field] === "string" && !payload[field].trim()) //condition for empty string
    ) {
      throw new ApiError(400, `${field} is required`);
    }
  }

  return true;
};
export { validateSocketPayload };

// Payload = the actual data sent with an event/request.
// Example:
// socket.emit("message:send", {
//   conversationId: "123",
//   content: "Hello",
//   type: "TEXT"
// });

// Here:
// Event → "message:send" — tells the server what happened
// Payload → { conversationId, content, type } — tells the server the data/details
// Socket → the connection between client and server
// Emit → send an event
// Listen / on() → wait for an event
// Handler → function that runs when the event is received

// Event = WHAT happened
// Payload = DATA about what happened
