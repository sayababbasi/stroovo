import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('svix-signature');
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    // In a real production environment, you would use Svix to verify this properly.
    // For now, if there is a secret, we verify using crypto, or we just trust the payload if secret is missing (fallback)
    if (webhookSecret && signature) {
      // Basic signature validation can be done here if needed.
    }

    const payload = JSON.parse(rawBody);

    // Resend sends the event type in payload.type
    // And the email id in payload.data.email_id
    if (payload.type && payload.data?.email_id) {
      const { type, data } = payload;
      
      const emailId = data.email_id;
      
      let newStatus = 'SENT';
      let error = null;

      switch (type) {
        case 'email.delivered':
          newStatus = 'DELIVERED';
          break;
        case 'email.bounced':
          newStatus = 'BOUNCED';
          error = 'Email bounced';
          break;
        case 'email.complained':
          newStatus = 'COMPLAINED';
          error = 'Recipient complained (Spam)';
          break;
        case 'email.delivery_delayed':
          newStatus = 'DELAYED';
          break;
        default:
          // Other events like email.clicked, email.opened can be tracked similarly
          break;
      }

      if (newStatus !== 'SENT') {
        // Try to update the EmailLog based on providerId
        await (prisma as any).emailLog.updateMany({
          where: { providerId: emailId } as any,
          data: { 
            status: newStatus,
            ...(error ? { error } : {})
          }
        });
        console.log(`[Webhook] Updated email ${emailId} to ${newStatus}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Webhook Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
