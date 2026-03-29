import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { notificationService } from "../services/notification.service";

export const notificationsRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional() }).optional())
    .query(({ ctx, input }) =>
      notificationService.list(ctx.user.id, input?.limit)),

  unreadCount: protectedProcedure.query(({ ctx }) =>
    notificationService.unreadCount(ctx.user.id)),

  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await notificationService.markRead(input.id);
      return { success: true };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await notificationService.markAllRead(ctx.user.id);
    return { success: true };
  }),
});
