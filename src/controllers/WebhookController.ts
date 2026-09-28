import type { Request, Response } from 'express';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';
import { sendSuccess } from '../utils/response.js';

export class WebhookController {
  public verifyWebhook = (req: Request, res: Response): void => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
        logger.info('Webhook verified successfully.');
        res.status(200).send(challenge);
      } else {
        logger.warn('Webhook verification failed: token mismatch');
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(400);
    }
  };

  public receiveWebhook = (req: Request, res: Response): void => {
    const body = req.body;

    // Log the incoming webhook event
    logger.info({ webhookBody: body }, 'Received Webhook Event');

    // Handle different types of events here (e.g., messages, statuses)
    // For now, we just acknowledge receipt
    sendSuccess(res, null, 'EVENT_RECEIVED', 200);
  };
}
