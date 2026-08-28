// Stores rate-limit information for each active socket.
// Key   → socketId
// Value → { count, startTime }
const socketLimits = new Map();

// Maximum messages allowed during one time window.
const LIMIT = 10;

// Time window = 10 seconds (milliseconds).
const WINDOW = 10 * 1000;

const validateSocketRateLimit = (socketId) => {
  // Check whether we already have a rate-limit record
  // for this socket.
  const record = socketLimits.get(socketId);

  // ------------------------------------------
  // CASE 1: First message from this socket
  // ------------------------------------------
  if (!record) {
    socketLimits.set(socketId, {
      count: 1,
      startTime: Date.now(),
    });

    // Message is allowed.
    return true;
  }

  // ------------------------------------------
  // CASE 2: Existing socket
  // ------------------------------------------
  // Calculate how much time has passed since
  // this socket's current rate-limit window started.
  const elapsedTime = Date.now() - record.startTime;

  // ------------------------------------------
  // CASE 3: 10-second window has expired
  // ------------------------------------------
  // Start a fresh window and reset the counter.
  if (elapsedTime >= WINDOW) {
    socketLimits.set(socketId, {
      count: 1,
      startTime: Date.now(),
    });

    // First message of the new window is allowed.
    return true;
  }

  // ------------------------------------------
  // CASE 4: Limit reached
  // ------------------------------------------
  // The socket has already sent 10 messages
  // within the current 10-second window.
  if (record.count >= LIMIT) {
    // Reject the message.
    return false;
  }

  // ------------------------------------------
  // CASE 5: Still below the limit
  // ------------------------------------------
  // Allow the message and increase the counter.
  record.count++;

  return true;
};

export { validateSocketRateLimit };
