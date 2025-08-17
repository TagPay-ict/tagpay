import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushReceipt } from 'expo-server-sdk';
import { expo, NOTIFICATION_TEMPLATES, RETRY_CONFIG } from '../../config/notification.config';
import { notifications, userDevices, userNotificationPreferences } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { systemLogger } from '../../utils/logger';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schemas from "../../db/schema"

export interface NotificationData {
  userId: string;
  templateName: keyof typeof NOTIFICATION_TEMPLATES;
  data?: Record<string, any>;
  customTitle?: string;
  customBody?: string;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deviceCount: number;
  tickets?: ExpoPushTicket[];
}

export default class NotificationService {
  private expo: Expo;
  private readonly db: NodePgDatabase<typeof schemas> & { $client: Pool };
  
  constructor(db: NodePgDatabase<typeof schemas> & { $client: Pool }) {
    this.expo = expo;
    this.db = db;
  }

  /**
   * Send notification to a single user
   */
  async sendNotification(notificationData: NotificationData): Promise<NotificationResult> {
    try {
      // Check if user has notifications enabled for this category
      const template = NOTIFICATION_TEMPLATES[notificationData.templateName];
      const isEnabled = await this.isNotificationEnabled(notificationData.userId, template.category);
      
      if (!isEnabled) {
        return {
          success: false,
          error: 'Notifications disabled for this category',
          deviceCount: 0,
        };
      }

      // Get user's active device tokens
      const devices = await this.getUserDevices(notificationData.userId);
      
      if (devices.length === 0) {
        return {
          success: false,
          error: 'No active devices found',
          deviceCount: 0,
        };
      }

      // Prepare notification message
      const message = this.prepareNotificationMessage(
        devices.map((d: any) => d.deviceToken),
        template,
        notificationData
      );

      // Send notification with retry logic
      const result = await this.sendPushNotificationWithRetry(message);

      // Log notification
      await this.logNotification(notificationData, result);

      // Schedule receipt check for 15 minutes later
      setTimeout(() => {
        this.checkPushReceipts(result.tickets || []);
      }, 15 * 60 * 1000); // 15 minutes

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        deviceCount: devices.length,
        tickets: result.tickets,
      };
    } catch (error) {
      systemLogger.error('Error sending notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        deviceCount: 0,
      };
    }
  }



  /**
   * Send notification to multiple users
   */
  async sendBulkNotification(
    notifications: NotificationData[]
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    
    for (const notification of notifications) {
      const result = await this.sendNotification(notification);
      results.push(result);
    }

    return results;
  }

  /**
   * Register a new device token
   */
  async registerDevice(
    userId: string,
    deviceToken: string,
    platform: 'ios' | 'android',
    appVersion?: string
  ): Promise<boolean> {
    try {
      // Check if device token is valid
      if (!Expo.isExpoPushToken(deviceToken)) {
        throw new Error('Invalid Expo push token');
      }

      // Check if device already exists
      const existingDevice = await this.db
        .select()
        .from(userDevices)
        .where(
          and(
            eq(userDevices.userId, userId),
            eq(userDevices.deviceToken, deviceToken)
          )
        )
        .limit(1);

      if (existingDevice.length > 0) {
        // Update existing device
        await this.db
          .update(userDevices)
          .set({
            platform,
            appVersion,
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(userDevices.id, existingDevice[0].id));
      } else {
        // Create new device
        await this.db.insert(userDevices).values({
          userId,
          deviceToken,
          platform,
          appVersion,
          isActive: true,
        });
      }

      return true;
    } catch (error) {
      systemLogger.error('Error registering device:', error);
      return false;
    }
  }

  /**
   * Unregister a device token
   */
  async unregisterDevice(userId: string, deviceToken: string): Promise<boolean> {
    try {
      await this.db
        .update(userDevices)
        .set({ isActive: false, updatedAt: new Date() })
        .where(
          and(
            eq(userDevices.userId, userId),
            eq(userDevices.deviceToken, deviceToken)
          )
        );

      return true;
    } catch (error) {
      systemLogger.error('Error unregistering device:', error);
      return false;
    }
  }

  /**
   * Get user's notification preferences
   */
  async getUserPreferences(userId: string) {
    return await this.db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, userId));
  }

  /**
   * Update user's notification preferences
   */
  async updateUserPreferences(
    userId: string,
    category: string,
    isEnabled: boolean
  ): Promise<boolean> {
    try {
      const existing = await this.db
        .select()
        .from(userNotificationPreferences)
        .where(
          and(
            eq(userNotificationPreferences.userId, userId),
            eq(userNotificationPreferences.category, category)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await this.db
          .update(userNotificationPreferences)
          .set({ isEnabled, updatedAt: new Date() })
          .where(eq(userNotificationPreferences.id, existing[0].id));
      } else {
        await this.db.insert(userNotificationPreferences).values({
          userId,
          category,
          isEnabled,
        });
      }

      return true;
    } catch (error) {
      systemLogger.error('Error updating user preferences:', error);
      return false;
    }
  }

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(userId: string, limit = 50) {
    return await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt)
      .limit(limit);
  }

  // Private helper methods

  private async isNotificationEnabled(userId: string, category: string): Promise<boolean> {
    const preference = await this.db
      .select()
      .from(userNotificationPreferences)
      .where(
        and(
          eq(userNotificationPreferences.userId, userId),
          eq(userNotificationPreferences.category, category)
        )
      )
      .limit(1);

    return preference.length === 0 || (preference[0].isEnabled ?? true);
  }

  private async getUserDevices(userId: string) {
    return await this.db
      .select()
      .from(userDevices)
      .where(
        and(
          eq(userDevices.userId, userId),
          eq(userDevices.isActive, true)
        )
      );
  }

  private prepareNotificationMessage(
    deviceTokens: string[],
    template: any,
    notificationData: NotificationData
  ): ExpoPushMessage {
    const title = notificationData.customTitle || this.interpolateTemplate(template.title, notificationData.data);
    const body = notificationData.customBody || this.interpolateTemplate(template.body, notificationData.data);

    return {
      to: deviceTokens,
      title,
      body,
      data: notificationData.data || {},
      sound: 'default',
      priority: 'high',
      channelId: template.category,
      ttl: 24 * 60 * 60, // 24 hours
    };
  }

  private interpolateTemplate(template: string, data?: Record<string, any>): string {
    if (!data) return template;
    
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  /**
   * Send push notification with retry logic and exponential backoff
   */
  private async sendPushNotificationWithRetry(message: ExpoPushMessage): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    tickets?: ExpoPushTicket[];
  }> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= RETRY_CONFIG.MAX_RETRIES; attempt++) {
      try {
        const result = await this.sendPushNotification(message);
        
        if (result.success) {
          return result;
        }
        
        // If it's a permanent error, don't retry
        if (result.error?.includes('InvalidCredentials') || result.error?.includes('MessageTooBig')) {
          return result;
        }
        
        lastError = new Error(result.error);
        
        // If this is not the last attempt, wait before retrying
        if (attempt < RETRY_CONFIG.MAX_RETRIES) {
          const delay = RETRY_CONFIG.RETRY_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // If this is not the last attempt, wait before retrying
        if (attempt < RETRY_CONFIG.MAX_RETRIES) {
          const delay = RETRY_CONFIG.RETRY_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    return {
      success: false,
      error: lastError?.message || 'Max retries exceeded',
    };
  }

  /**
   * Send push notification using Expo SDK
   */
  private async sendPushNotification(message: ExpoPushMessage): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    tickets?: ExpoPushTicket[];
  }> {
    try {
      const chunks = this.expo.chunkPushNotifications([message]);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          systemLogger.error('Error sending push notification chunk:', error);
          throw error;
        }
      }

      const errors = tickets.filter(ticket => ticket.status === 'error');
      if (errors.length > 0) {
        return {
          success: false,
          error: `Failed to send to ${errors.length} devices`,
          tickets,
        };
      }

      const firstTicket = tickets[0];
      const messageId = firstTicket && 'id' in firstTicket ? firstTicket.id : undefined;

      return {
        success: true,
        messageId,
        tickets,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check push receipts for delivery status
   */
  private async checkPushReceipts(tickets: ExpoPushTicket[]) {
    try {
      const validTickets = tickets.filter(ticket => ticket.status === 'ok');
      const receiptIds: string[] = [];
      
      for (const ticket of validTickets) {
        if ('id' in ticket && ticket.id) {
          receiptIds.push(ticket.id);
        }
      }
      
      if (receiptIds.length === 0) {
        return;
      }

      // Get receipts
      const receipts = await this.expo.getPushNotificationReceiptsAsync(receiptIds);

      // Process receipts
      for (const [receiptId, receipt] of Object.entries(receipts)) {
        if (receipt.status === 'error') {
          await this.handleReceiptError(receiptId, receipt);
        } else {
          await this.updateNotificationStatus(receiptId, 'delivered');
        }
      }
    } catch (error) {
      systemLogger.error('Error checking push receipts:', error);
    }
  }

  /**
   * Handle receipt errors (e.g., DeviceNotRegistered)
   */
  private async handleReceiptError(receiptId: string, receipt: ExpoPushReceipt) {
    systemLogger.error(`Push receipt error for ${receiptId}:`, receipt);

    if (receipt.status === 'error' && 'details' in receipt && receipt.details) {
      const details = receipt.details as any;
      if (details.error === 'DeviceNotRegistered') {
        // Find and deactivate the device token
        await this.deactivateDeviceByReceipt(receiptId);
      }
    }

    const errorMessage = receipt.status === 'error' && 'message' in receipt ? receipt.message : 'Unknown error';
    await this.updateNotificationStatus(receiptId, 'failed', errorMessage);
  }

  /**
   * Deactivate device when it's not registered
   */
  private async deactivateDeviceByReceipt(receiptId: string) {
    try {
      // Find the notification by receipt ID and deactivate the associated device
      const notification = await this.db
        .select()
        .from(notifications)
        .where(eq(notifications.id, receiptId))
        .limit(1);

      if (notification.length > 0) {
        // This is a simplified approach - in a real implementation,
        // you'd need to track which device token was used for each notification
        systemLogger.warn(`Device not registered for notification ${receiptId}`);
      }
    } catch (error) {
      systemLogger.error('Error deactivating device:', error);
    }
  }

  /**
   * Update notification status in database
   */
  private async updateNotificationStatus(receiptId: string, status: string, errorMessage?: string) {
    try {
      await this.db
        .update(notifications)
        .set({
          status,
          deliveredAt: status === 'delivered' ? new Date() : undefined,
          errorMessage,
        })
        .where(eq(notifications.id, receiptId));
    } catch (error) {
      systemLogger.error('Error updating notification status:', error);
    }
  }

  private async logNotification(
    notificationData: NotificationData,
    result: { success: boolean; messageId?: string; error?: string; tickets?: ExpoPushTicket[] }
  ) {
    const template = NOTIFICATION_TEMPLATES[notificationData.templateName];
    
    await this.db.insert(notifications).values({
      userId: notificationData.userId,
      title: notificationData.customTitle || template.title,
      body: notificationData.customBody || template.body,
      data: notificationData.data,
      status: result.success ? 'sent' : 'failed',
      sentAt: result.success ? new Date() : undefined,
      errorMessage: result.error,
    });
  }
}

