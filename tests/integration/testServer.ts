import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../src/config/database.js';

let mongoServer: MongoMemoryServer | undefined;

export async function startTestDatabase(): Promise<void> {
  mongoServer = await MongoMemoryServer.create();
  await connectDB(mongoServer.getUri());
}

export async function stopTestDatabase(): Promise<void> {
  await disconnectDB();
  await mongoServer?.stop();
  mongoServer = undefined;
}

export async function clearTestDatabase(): Promise<void> {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}
