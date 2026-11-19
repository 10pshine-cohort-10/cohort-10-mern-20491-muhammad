
import logger from "../utils/logger.js";

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;

  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
    },
    "Request failed"
  );

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message,
  });
};

export default errorHandler;
