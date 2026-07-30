import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

export async function connectDB(uri: string = config.mongodb.uri): Promise<typeof mongoose> {

  console.log(uri,"uri")
  const conn = await mongoose.connect(uri);

  logger.info({ host: conn.connection.host }, 'MongoDB connected');

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (error: Error) => {
    logger.error({ err: error }, 'MongoDB connection error');
  });

  return conn;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
