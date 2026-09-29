import { config } from '../config/env.js';
import type { IBooking } from '../interfaces/booking.interface.js';

export class WhatsAppService {
  // Using the phone number ID from the provided curl command
  private readonly baseUrl = 'https://graph.facebook.com/v25.0/1296067430266505/messages';

  async sendBookingConfirmation(_booking: IBooking, to: string = '919014902932') {
    if (!config.whatsapp.token) {
      console.warn('WhatsApp token is not configured. Skipping message.');
      return;
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.whatsapp.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: 'jaspers_market_plain_text_v1',
            language: { code: 'en_US' }
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Failed to send WhatsApp message:', errorData);
      } else {
        const data = await response.json();
        console.log('WhatsApp message sent successfully:', data);
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
    }
  }
}

export const whatsAppService = new WhatsAppService();
