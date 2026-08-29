import crypto from "crypto";

const requestId = (req, res, next) => {
  const id = crypto.randomUUID();

  req.requestId = id; // assign unique id to incomming request
  res.setHeader("X-Request-ID", id);

  next();
};

export { requestId };

// This is a useful maintenance/debugging feature. Every request gets a unique ID, so later we can trace a request across logs, errors, payments, etc.
