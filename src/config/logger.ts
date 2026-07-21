import pino from 'pino';
import { config } from './env.js';

export const logger = pino({
  level: config.isProduction ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'newPassword',
      'currentPassword',
      '*.password',
      '*.jwt.secret',
      'config.jwt.secret',
    ],
    censor: '[REDACTED]',
  },
  transport: config.isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});
