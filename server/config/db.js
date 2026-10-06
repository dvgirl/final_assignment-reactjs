const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Uses MONGO_URI from environment variables, falls back to local MongoDB
 */
const connectDB = async (retryCount = 0) => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/visitor_pass_db';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (retryCount < 5) {
      const waitTime = Math.min(2000 * (retryCount + 1), 10000);
      console.log(`[Database] Retrying connection in ${waitTime / 1000}s (Attempt ${retryCount + 1}/5)...`);
      setTimeout(() => connectDB(retryCount + 1), waitTime);
    } else {
      console.error('[Database Error] Max connection retries reached. Please verify MongoDB service.');
    }
  }
};

// Monitor ongoing connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[Database Warning] MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database] MongoDB reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Error] Runtime error: ${err.message}`);
});

module.exports = connectDB;
