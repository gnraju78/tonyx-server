import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController.js';

const router = Router();
const webhookController = new WebhookController();

// Verification endpoint for Meta/WhatsApp
router.get('/', webhookController.verifyWebhook);

// Endpoint for receiving webhook events
router.post('/', webhookController.receiveWebhook);

export default router;
