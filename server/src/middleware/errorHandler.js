
import logger from "../utils/logger.js";

export const createErrorHandler = (loggerInstance = logger) => {
  return (err, req, res, _next) => {
    const statusCode = err.statusCode || 500;

    const isMalformedJson =
      err.type === "entity.parse.failed" ||
      (err instanceof SyntaxError && statusCode === 400);

    if (isMalformedJson) {
      loggerInstance.error(
        {
          statusCode,
          errorType: err.type || err.name,
          method: req.method,
          url: req.originalUrl,
        },
        "Request failed"
      );
    } else {
      loggerInstance.error(
        {
          err,
          method: req.method,
          url: req.originalUrl,
        },
        "Request failed"
      );
    }

    res.status(statusCode).json({
      success: false,
      message:
        statusCode === 500
          ? "Internal server error"
          : err.message,
    });
  };
};

const errorHandler = createErrorHandler();

export default errorHandler;
