import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { pinoHttp } from 'pino-http';
import 'express-async-errors';

import { config } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { sanitizeInput } from './middlewares/sanitize.js';
import { generalRateLimiter } from './middlewares/rateLimiter.js';
import { sendSuccess } from './utils/response.js';
import { NotFoundError } from './utils/AppError.js';
import { mountDocs } from './docs/swagger.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
    })
  );
  app.use(compression());
  app.use(pinoHttp({ logger }));

  app.use(generalRateLimiter);

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ limit: '10kb', extended: true }));
  app.use(sanitizeInput);

  mountDocs(app);

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/services', serviceRoutes);
  app.use('/api/v1/bookings', bookingRoutes);
  app.use('/api/v1/webhooks', webhookRoutes);

  app.get('/health', (_req, res) => {
    sendSuccess(res, { status: 'OK' }, 'Service is healthy');
  });

  app.use((req, _res, next) => {
    next(new NotFoundError(`Cannot find ${req.originalUrl} on this server`));
  });

  app.use(errorHandler);

  return app;
}
