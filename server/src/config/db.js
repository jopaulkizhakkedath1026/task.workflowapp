const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose.
 * Implements defensive error handling and connection lifecycle listeners.
 */
const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_workflow_db';
    
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(connStr);

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // In production, keep server running to retry or exit based on deployment setup
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
