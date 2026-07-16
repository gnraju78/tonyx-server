import mongoose from 'mongoose';
import config from '../../config/index.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, config.mongodb.options);

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);

    // Set up connection event listeners
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    process.exit(1);
  }
};

export default {
  connectDB,
  disconnectDB,
};
