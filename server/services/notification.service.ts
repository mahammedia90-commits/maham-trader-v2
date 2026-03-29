import * as db from "../db";

export const notificationService = {
  list: (userId: number, limit = 50) => db.listNotificationsByUser(userId, limit),
  unreadCount: (userId: number) => db.countUnreadNotifications(userId),
  markRead: (notifId: number) => db.markNotificationRead(notifId),
  markAllRead: (userId: number) => db.markAllNotificationsRead(userId),
};
