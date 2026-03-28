import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const notificationsRouter = router({
  // List notifications
  list: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return db.listNotificationsByUser(ctx.user.id, input?.limit ?? 50);
    }),

  // Count unread
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return db.countUnreadNotifications(ctx.user.id);
  }),

  // Mark single as read
  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.markNotificationRead(input.id);
      return { success: true };
    }),

  // Mark all as read
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await db.markAllNotificationsRead(ctx.user.id);
    return { success: true };
  }),
});
