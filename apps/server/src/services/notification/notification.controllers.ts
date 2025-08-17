import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { systemLogger } from "../../utils/logger";
import  NotificationService  from "./notification.services";

export default class NotificationController {

  private readonly services: NotificationService

  constructor(services: NotificationService) {
    this.services = services
  }

  /**
   * Send notification to a user
   */
  public sendNotification = asyncHandler(
    async (req: Request, res: Response) => {
      const { userId, templateName, data, customTitle, customBody } = req.body;

      if (!userId || !templateName) {
        return res.status(400).json({
          success: false,
          message: "userId and templateName are required",
        });
      }

      const result = await this.services.sendNotification({
        userId,
        templateName,
        data,
        customTitle,
        customBody,
      });

      return res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.success
          ? "Notification sent successfully"
          : result.error,
        data: {
          deviceCount: result.deviceCount,
          messageId: result.messageId,
        },
      });
    }
  );

  /**
   * Send notification to multiple users
   */
  public sendBulkNotification = asyncHandler(
    async (req: Request, res: Response) => {
      const { notifications } = req.body;

      if (!notifications || !Array.isArray(notifications)) {
        return res.status(400).json({
          success: false,
          message: "notifications array is required",
        });
      }

      const results =
        await this.services.sendBulkNotification(notifications);

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.length - successCount;

      return res.status(200).json({
        success: true,
        message: `Sent ${successCount} notifications, ${failureCount} failed`,
        data: {
          results,
          summary: {
            total: results.length,
            success: successCount,
            failed: failureCount,
          },
        },
      });
    }
  );

  /**
   * Register a device token
   */
  public registerDevice = asyncHandler(async (req: Request, res: Response) => {
    const { deviceToken, platform, appVersion } = req.body;
    const userId = req.user?.id; // From auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!deviceToken || !platform) {
      return res.status(400).json({
        success: false,
        message: "deviceToken and platform are required",
      });
    }

    const success = await this.services.registerDevice(
      userId,
      deviceToken,
      platform,
      appVersion
    );

    return res.status(success ? 200 : 400).json({
      success,
      message: success
        ? "Device registered successfully"
        : "Failed to register device",
    });
  });

  /**
   * Unregister a device token
   */
  public unregisterDevice = asyncHandler(
    async (req: Request, res: Response) => {
      const { deviceToken } = req.body;
      const userId = req.user?.id; // From auth middleware

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      if (!deviceToken) {
        return res.status(400).json({
          success: false,
          message: "deviceToken is required",
        });
      }

      const success = await this.services.unregisterDevice(
        userId,
        deviceToken
      );

      return res.status(success ? 200 : 400).json({
        success,
        message: success
          ? "Device unregistered successfully"
          : "Failed to unregister device",
      });
    }
  );

  /**
   * Get user's notification preferences
   */
  public getUserPreferences = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?.id; // From auth middleware

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const preferences = await this.services.getUserPreferences(userId);

      return res.status(200).json({
        success: true,
        data: preferences,
      });
    }
  );

  /**
   * Update user's notification preferences
   */
  public updateUserPreferences = asyncHandler(
    async (req: Request, res: Response) => {
      const { category, isEnabled } = req.body;
      const userId = req.user?.id; // From auth middleware

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      if (!category || typeof isEnabled !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "category and isEnabled are required",
        });
      }

      const success = await this.services.updateUserPreferences(
        userId,
        category,
        isEnabled
      );

      return res.status(success ? 200 : 400).json({
        success,
        message: success
          ? "Preferences updated successfully"
          : "Failed to update preferences",
      });
    }
  );

  /**
   * Get notification history
   */
  public getNotificationHistory = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?.id; // From auth middleware
      const limit = parseInt(req.query.limit as string) || 50;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const history = await this.services.getNotificationHistory(
        userId,
        limit
      );

      return res.status(200).json({
        success: true,
        data: history,
      });
    }
  );
}
