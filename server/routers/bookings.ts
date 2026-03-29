import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { bookingService } from "../services/booking.service";

export const bookingsRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    bookingService.listByUser(ctx.user.id),
  ),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) =>
      bookingService.getByIdForUser(input.id, ctx.user.id),
    ),

  create: protectedProcedure
    .input(z.object({
      eventId: z.number(),
      unitId: z.number(),
      notes: z.string().max(2000).optional(),
      promoCode: z.string().max(50).optional(),
    }))
    .mutation(({ ctx, input }) =>
      bookingService.create(ctx.user.id, ctx.user.kycStatus, input),
    ),

  cancel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) =>
      bookingService.cancel(input.id, ctx.user.id),
    ),

  validatePromo: protectedProcedure
    .input(z.object({
      code: z.string().min(1).max(50),
      eventId: z.number().optional(),
    }))
    .query(({ input }) =>
      bookingService.validatePromo(input.code, input.eventId),
    ),
});
