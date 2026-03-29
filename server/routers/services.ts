import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import * as db from "../db";
import { nanoid } from "nanoid";

export const servicesRouter = router({
  list: publicProcedure
    .input(z.object({ eventId: z.number().optional() }).optional())
    .query(({ input }) => db.listServiceItems(input?.eventId)),

  order: protectedProcedure
    .input(z.object({
      bookingId: z.number().optional(),
      items: z.array(z.object({
        serviceId: z.number(),
        name: z.string().max(255),
        price: z.number().positive().max(999999),
        quantity: z.number().int().positive().max(10000),
        unit: z.string().max(50),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const totalAmount = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const orderNumber = `SO-${nanoid(8).toUpperCase()}`;
      const orderId = await db.createServiceOrder({
        orderNumber, userId: ctx.user.id, bookingId: input.bookingId ?? null,
        items: input.items, totalAmount: totalAmount.toFixed(2), status: "pending",
      });
      return { orderId, orderNumber, totalAmount };
    }),

  myOrders: protectedProcedure.query(({ ctx }) =>
    db.listServiceOrdersByUser(ctx.user.id)),
});
