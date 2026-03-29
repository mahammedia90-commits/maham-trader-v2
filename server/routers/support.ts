import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { supportService } from "../services/support.service";

export const supportRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    supportService.list(ctx.user.id)),

  create: protectedProcedure
    .input(z.object({
      subject: z.string().min(3).max(500),
      message: z.string().min(10).max(10000),
      category: z.enum(["booking", "payment", "contract", "technical", "general", "complaint"]).optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    }))
    .mutation(({ ctx, input }) =>
      supportService.create(ctx.user.id, input)),

  messages: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(({ input }) =>
      supportService.listMessages(input.ticketId)),

  reply: protectedProcedure
    .input(z.object({
      ticketId: z.number(),
      message: z.string().min(1).max(10000),
      attachmentUrl: z.string().url().max(2000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const msgId = await supportService.reply(ctx.user.id, input);
      return { messageId: msgId };
    }),
});
