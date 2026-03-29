import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const reviewsRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    db.listReviewsByUser(ctx.user.id)),

  create: protectedProcedure
    .input(z.object({
      eventId: z.number().optional(),
      bookingId: z.number().optional(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().max(2000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const reviewId = await db.createReview({
        userId: ctx.user.id, eventId: input.eventId ?? null,
        bookingId: input.bookingId ?? null, rating: input.rating,
        comment: input.comment ?? null,
      });
      return { reviewId };
    }),
});
