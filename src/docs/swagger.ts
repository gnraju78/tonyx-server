import type { Express } from 'express';
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import swaggerUi from 'swagger-ui-express';
import { registry } from './registry.js';
import { config } from '../config/env.js';

function buildOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'TonyX Studio API',
      version: '2.0.0',
      description: 'Haircut booking platform API — auth, users/barbers, services, bookings.',
    },
    servers: [{ url: config.baseUrl }],
  });
}

export function mountDocs(app: Express): void {
  const document = buildOpenApiDocument();

  app.get('/api/docs.json', (_req, res) => {
    res.json(document);
  });

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(document));
}
