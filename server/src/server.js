
import "dotenv/config";

import app from "./app.js";
import connectDatabase from "./config/database.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    server.on("error", (error) => {
      logger.error({ err: error }, "Could not start the server");
      process.exit(1);
    });
  } catch (error) {
    logger.error({ err: error }, "Could not start the server");
    process.exit(1);
  }
};

startServer();
