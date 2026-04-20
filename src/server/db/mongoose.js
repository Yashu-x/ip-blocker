const mongoose = require("mongoose");

const { env } = require("../config/env");
const { logger } = require("../utils/logger");

let connectionPromise;

async function connectToDatabase() {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
  }

  await connectionPromise;
  logger.info("Connected to MongoDB");
}

module.exports = { connectToDatabase };
