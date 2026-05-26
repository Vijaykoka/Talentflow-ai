/**
 * P2: Notification System (Email stubs + in-app notification log)
 *
 * This module provides:
 * - In-memory notification log for the current session
 * - Email notification stubs (logs intent without actual SMTP)
 * - Notification retrieval API for the frontend
 */

export interface Notification {
  id: string;
  type: "AUTO_MATCH" | "HIRE" | "WORKFLOW" | "VENDOR" | "SYSTEM";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  emailSent?: boolean;
}

// In-memory notification store (persists for server lifetime)
const notifications: Notification[] = [];
let counter = 0;

/**
 * Log a notification. In production, this would also trigger
 * email via SendGrid/SES. For now it logs + stores in memory.
 */
export function logNotification(params: {
  type: Notification["type"];
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  emailTo?: string;
}): Notification {
  const notification: Notification = {
    id: `notif-${++counter}-${Date.now()}`,
    type: params.type,
    title: params.title,
    message: params.message,
    timestamp: new Date().toISOString(),
    read: false,
    metadata: params.metadata,
    emailSent: false,
  };

  notifications.unshift(notification);

  // Keep last 100 notifications in memory
  if (notifications.length > 100) {
    notifications.pop();
  }

  // Email stub — log the intent
  if (params.emailTo) {
    console.log(`[EMAIL STUB] To: ${params.emailTo} | Subject: ${params.title} | Body: ${params.message}`);
    notification.emailSent = true;
  }

  console.log(`[NOTIFICATION] [${params.type}] ${params.title}: ${params.message}`);
  return notification;
}

/**
 * Get all notifications, optionally filtered
 */
export function getNotifications(opts?: { unreadOnly?: boolean; limit?: number }): Notification[] {
  let result = [...notifications];
  if (opts?.unreadOnly) {
    result = result.filter(n => !n.read);
  }
  if (opts?.limit) {
    result = result.slice(0, opts.limit);
  }
  return result;
}

/**
 * Mark a notification as read
 */
export function markRead(id: string): boolean {
  const notif = notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    return true;
  }
  return false;
}

/**
 * Mark all notifications as read
 */
export function markAllRead(): number {
  let count = 0;
  for (const n of notifications) {
    if (!n.read) {
      n.read = true;
      count++;
    }
  }
  return count;
}

/**
 * Get unread count
 */
export function getUnreadCount(): number {
  return notifications.filter(n => !n.read).length;
}
