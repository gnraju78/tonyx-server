import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();
loadDotenv();


const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  PROTOCOL: z.enum(['http', 'https']).default('http'),
  HOST: z.string().min(1).default('localhost'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRE: z.string().min(1).default('7d'),

  CLOUDINARY_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  WHATSAPP_TOKEN: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional().default('my_secure_verify_token'),
});

function parseEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues.map(
      (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
    );
    // eslint-disable-next-line no-console
    console.error(`Invalid environment configuration:\n${issues.join('\n')}`);
    process.exit(1);
  }

  return parsed.data;
}

const env = parseEnv();

export const config = Object.freeze({
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',
  port: env.PORT,
  protocol: env.PROTOCOL,
  host: env.HOST,
  get baseUrl() {
    return `${env.PROTOCOL}://${env.HOST}:${env.PORT}`;
  },

  mongodb: {
    uri: env.MONGODB_URI,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRE,
  },

  cloudinary: {
    cloudName: env.CLOUDINARY_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
    isConfigured: Boolean(
      env.CLOUDINARY_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
    ),
  },

  whatsapp: {
    token: env.WHATSAPP_TOKEN,
    verifyToken: env.WHATSAPP_VERIFY_TOKEN,
  },

  frontendUrl: env.FRONTEND_URL,
});

export type AppConfig = typeof config;
