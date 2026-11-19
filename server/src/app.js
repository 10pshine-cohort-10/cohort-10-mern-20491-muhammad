
import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";

import logger from "./utils/logger.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());

app.use(pinoHttp({ logger }));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Notes API is running",
    timestamp: new Date().toISOString(),
  });
});
app.use(notFound);
app.use(errorHandler);

export default app;
