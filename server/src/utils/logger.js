
import pino from "pino";

const logLevel = process.env.LOG_LEVEL || "info";
const isDevelopment = process.env.NODE_ENV === "development";

const logger = pino({
  level: logLevel,
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
        },
      }
    : undefined,
});

export default logger;
