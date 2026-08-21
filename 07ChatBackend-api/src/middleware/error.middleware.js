const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate field value entered";
    errors = [];
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((error) => error.message);
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
  });
};

export { errorHandler };
