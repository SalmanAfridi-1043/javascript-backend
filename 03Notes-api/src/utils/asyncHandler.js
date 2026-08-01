const asyncHandler = (requestHandler) => (req, res, next) => {
  (req, res, next) => {
    promise
      .resolve(requestHandler(req, res, next))
      .catch((error) => next(error));
  };
};

export { asyncHandler };
