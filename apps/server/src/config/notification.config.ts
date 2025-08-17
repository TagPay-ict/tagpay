import { Expo } from 'expo-server-sdk';

// Expo configuration
export const expoConfig = {
  accessToken: process.env.EXPO_ACCESS_TOKEN || '',
  useFcmV1: true, // Use FCM v1 for better reliability
};

// Initialize Expo SDK
export const expo = new Expo({
  accessToken: expoConfig.accessToken,
  useFcmV1: expoConfig.useFcmV1,
});

// Notification categories
export const NOTIFICATION_CATEGORIES = {
  TRANSACTION: 'transaction',
  PROMOTION: 'promotion',
  SECURITY: 'security',
  AIRTIME: 'airtime',
  ACCOUNT: 'account',
} as const;

// Notification templates (can be moved to database later)
export const NOTIFICATION_TEMPLATES = {
  TRANSACTION_RECEIVED: {
    name: 'transaction_received',
    title: 'Money Received',
    body: 'You received ₦{amount} from {sender}',
    category: NOTIFICATION_CATEGORIES.TRANSACTION,
  },
  TRANSACTION_SENT: {
    name: 'transaction_sent',
    title: 'Money Sent',
    body: 'You sent ₦{amount} to {recipient}',
    category: NOTIFICATION_CATEGORIES.TRANSACTION,
  },
  AIRTIME_PURCHASED: {
    name: 'airtime_purchased',
    title: 'Airtime Purchase',
    body: 'You purchased ₦{amount} airtime for {phoneNumber}',
    category: NOTIFICATION_CATEGORIES.AIRTIME,
  },
  SECURITY_ALERT: {
    name: 'security_alert',
    title: 'Security Alert',
    body: 'New login detected on your account',
    category: NOTIFICATION_CATEGORIES.SECURITY,
  },
  PROMOTIONAL: {
    name: 'promotional',
    title: 'Special Offer',
    body: '{message}',
    category: NOTIFICATION_CATEGORIES.PROMOTION,
  },
} as const;

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  MAX_NOTIFICATIONS_PER_MINUTE: 10,
  MAX_NOTIFICATIONS_PER_HOUR: 100,
  MAX_NOTIFICATIONS_PER_DAY: 1000,
};

// Retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 seconds
  BACKOFF_MULTIPLIER: 2,
};
