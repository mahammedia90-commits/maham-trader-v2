import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";
import { nanoid } from "nanoid";

export const supportRouter = router({
  // List trader's tickets
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.listSupportTicketsByUser(ctx.user.id);
  }),

  // Create new ticket
  create: protectedProcedure
    .input(z.object({
      subject: z.string().min(3).max(500),
      message: z.string().min(10),
      category: z.enum(["booking", "payment", "contract", "technical", "general", "complaint"]).optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const ticketNumber = `TK-${nanoid(8).toUpperCase()}`;

      const ticketId = await db.createSupportTicket({
        ticketNumber,
        userId: ctx.user.id,
        subject: input.subject,
        message: input.message,
        category: input.category ?? "general",
        priority: input.priority ?? "medium",
        status: "open",
      });

      // Create initial message
      await db.createSupportMessage({
        ticketId,
        userId: ctx.user.id,
        message: input.message,
        isStaff: false,
      });

      // Notification
      await db.createNotification({
        userId: ctx.user.id,
        titleAr: "تم إنشاء تذكرة دعم",
        titleEn: "Support Ticket Created",
        messageAr: `تم إنشاء تذكرة الدعم رقم ${ticketNumber}. سيتم الرد عليك قريباً.`,
        messageEn: `Support ticket ${ticketNumber} has been created. We'll respond shortly.`,
        type: "support",
        channel: "in_app",
      });

      return { ticketId, ticketNumber };
    }),

  // Get ticket messages
  messages: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ input }) => {
      return db.listSupportMessagesByTicket(input.ticketId);
    }),

  // Reply to ticket
  reply: protectedProcedure
    .input(z.object({
      ticketId: z.number(),
      message: z.string().min(1),
      attachmentUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const msgId = await db.createSupportMessage({
        ticketId: input.ticketId,
        userId: ctx.user.id,
        message: input.message,
        isStaff: false,
        attachmentUrl: input.attachmentUrl ?? null,
      });
      return { messageId: msgId };
    }),
});
