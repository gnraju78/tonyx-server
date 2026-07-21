import { v2 as cloudinary } from 'cloudinary';
import { config } from './env.js';
import { logger } from './logger.js';

/**
 * Scaffolded for future image-upload endpoints (profile/service images).
 * No upload routes exist yet; this only configures the SDK when credentials
 * are present so importing it elsewhere never throws in environments that
 * don't need Cloudinary (e.g. CI, unit tests).
 */
const { cloudName, apiKey, apiSecret } = config.cloudinary;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
} else {
  logger.warn('Cloudinary credentials not configured — image upload features are unavailable');
}

export { cloudinary };
