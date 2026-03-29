import * as db from "../db";
import { nanoid } from "nanoid";
import { logger } from "../lib/logger";

export const supportService = {
  list: (userId: number) => db.listSupportTicketsByUser(userId),

  async create(userId: number, input: {
    subject: string; message: string; category?: string; priority?: string;
  }) {
    const ticketNumber = `TK-${nanoid(8).toUpperCase()}`;
    const ticketId = await db.createSupportTicket({
      ticketNumber,
      userId,
      subject: input.subject,
      message: input.message,
      category: input.category ?? "general",
      priority: input.priority ?? "medium",
      status: "open",
    });

    await db.createSupportMessage({ ticketId, userId, message: input.message, isStaff: false });

    await db.createNotification({
      userId,
      titleAr: "تم إنشاء تذكرة دعم",
      titleEn: "Support Ticket Created",
      messageAr: `تم إنشاء تذكرة الدعم رقم ${ticketNumber}. سيتم الرد عليك قريباً.`,
      messageEn: `Support ticket ${ticketNumber} has been created. We'll respond shortly.`,
      type: "support",
      channel: "in_app",
    });

    logger.info("Support ticket created", "SupportService", { ticketId, ticketNumber, userId });
    return { ticketId, ticketNumber };
  },

  listMessages: (ticketId: number) => db.listSupportMessagesByTicket(ticketId),

  async reply(userId: number, input: { ticketId: number; message: string; attachmentUrl?: string }) {
    return db.createSupportMessage({
      ticketId: input.ticketId,
      userId,
      message: input.message,
      isStaff: false,
      attachmentUrl: input.attachmentUrl ?? null,
    });
  },
};
