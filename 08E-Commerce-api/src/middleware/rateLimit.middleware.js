import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

export { apiLimiter };

// Adding Rate Limiting: Now we'll protect the API from excessive requests.
//it helps to protect our API from abuse and excessive requests.
// It helps prevent brute-force attacks, spam, and server overload.
