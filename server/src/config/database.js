
import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDatabase = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MongoDB connection URL is missing from the .env file");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  logger.info("MongoDB connected successfully");
};

export default connectDatabase;
