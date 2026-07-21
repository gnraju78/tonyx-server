import { createApp } from './app.js';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/database.js';
import { logger } from './config/logger.js';

async function startServer(): Promise<void> {
  await connectDB();

  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info(
      { env: config.env, port: config.port, url: config.baseUrl },
      'TonyX backend server running'
    );
  });

  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'Shutdown signal received: closing HTTP server');
    server.close(() => {
      void disconnectDB().finally(() => {
        logger.info('Shutdown complete');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((error: unknown) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
