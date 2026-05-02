import { emailService } from '../src/notifications/email';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('Testing Internal Email connection...');
  // Note: we can't easily test dynamic without a tenant, but we can test the default .env logic
  // by mocking a NotificationPayload with a non-existent tenantId
  
  try {
    // Testing default internal
    await emailService.sendNotification({
      id: 'test_internal',
      type: 'TEST',
      title: 'Test Internal',
      message: 'Testing internal email profile',
      priority: 'LOW',
      userId: 'test_user',
      tenantId: 'non_existent',
      metadata: {}
    }, 'INTERNAL');
    
    console.log('Testing Customer Service Email connection...');
    await emailService.sendNotification({
      id: 'test_cs',
      type: 'TEST',
      title: 'Test CS',
      message: 'Testing customer service email profile',
      priority: 'LOW',
      userId: 'test_user',
      tenantId: 'non_existent',
      metadata: {}
    }, 'CUSTOMER_SERVICE');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Since I can't easily run this from here without setup, I'll just provide it as a reference or guide the user.
