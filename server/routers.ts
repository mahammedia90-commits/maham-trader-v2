import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

// Feature routers
import { eventsRouter } from "./routers/events";
import { bookingsRouter } from "./routers/bookings";
import { contractsRouter } from "./routers/contracts";
import { paymentsRouter } from "./routers/payments";
import { notificationsRouter } from "./routers/notifications";
import { kycRouter } from "./routers/kyc";
import { supportRouter } from "./routers/support";
import { servicesRouter } from "./routers/services";
import { teamRouter } from "./routers/team";
import { reviewsRouter } from "./routers/reviews";
import { analyticsRouter } from "./routers/analytics";

export const appRouter = router({
  system: systemRouter,

  // Auth routes
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    // Update trader profile
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        activityType: z.string().optional(),
        region: z.string().optional(),
        avatar: z.string().optional(),
        commercialRegister: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "profile.update",
          entity: "users",
          entityId: ctx.user.id,
          details: { updatedFields: Object.keys(input) },
        });
        return { success: true };
      }),
  }),

  // Feature routers
  events: eventsRouter,
  bookings: bookingsRouter,
  contracts: contractsRouter,
  payments: paymentsRouter,
  notifications: notificationsRouter,
  kyc: kycRouter,
  support: supportRouter,
  services: servicesRouter,
  team: teamRouter,
  reviews: reviewsRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
