import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import * as db from "../db";
import { nanoid } from "nanoid";

export const servicesRouter = router({
  // List available services (public)
  list: publicProcedure
    .input(z.object({ eventId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return db.listServiceItems(input?.eventId);
    }),

  // Create service order
  order: protectedProcedure
    .input(z.object({
      bookingId: z.number().optional(),
      items: z.array(z.object({
        serviceId: z.number(),
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
        unit: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const totalAmount = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const orderNumber = `SO-${nanoid(8).toUpperCase()}`;

      const orderId = await db.createServiceOrder({
        orderNumber,
        userId: ctx.user.id,
        bookingId: input.bookingId ?? null,
        items: input.items,
        totalAmount: totalAmount.toFixed(2),
        status: "pending",
      });

      await db.createNotification({
        userId: ctx.user.id,
        titleAr: "طلب خدمة جديد",
        titleEn: "New Service Order",
        messageAr: `تم إنشاء طلب الخدمة رقم ${orderNumber} بمبلغ ${totalAmount} ر.س`,
        messageEn: `Service order ${orderNumber} created for ${totalAmount} SAR`,
        type: "system",
        channel: "in_app",
      });

      return { orderId, orderNumber, totalAmount };
    }),

  // List trader's service orders
  myOrders: protectedProcedure.query(async ({ ctx }) => {
    return db.listServiceOrdersByUser(ctx.user.id);
  }),
});
