import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const reviewsRouter = router({
  // List trader's reviews
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.listReviewsByUser(ctx.user.id);
  }),

  // Create review
  create: protectedProcedure
    .input(z.object({
      eventId: z.number().optional(),
      bookingId: z.number().optional(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const reviewId = await db.createReview({
        userId: ctx.user.id,
        eventId: input.eventId ?? null,
        bookingId: input.bookingId ?? null,
        rating: input.rating,
        comment: input.comment ?? null,
      });
      return { reviewId };
    }),
});
