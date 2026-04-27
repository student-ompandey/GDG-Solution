const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { MONGODB_URI } = require('./env');

/**
 * Connect to MongoDB with retry logic.
 * Mongoose 8+ uses the new connection string parser by default.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting reconnect…');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    // Exit process with failure — let the process manager restart
    process.exit(1);
  }
};

module.exports = connectDB;
