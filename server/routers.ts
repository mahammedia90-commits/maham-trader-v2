import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
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

// Dev OTP store - bypasses DB timezone issues. REMOVE when Msegat SMS is live.
const devOtpStore = new Map<string, string>();

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

  // Merchant OTP Login Flow
  merchantAuth: router({
    sendOtp: publicProcedure.input(z.object({
      phone: z.string().min(9).max(15).regex(/^\+?[0-9]+$/, "Invalid phone format"),
    })).mutation(async ({ input }) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await db.createOtp(input.phone, code);
      // Dev: store in memory for reliable verification
      // REMOVE this block when Msegat SMS is live:
      devOtpStore.set(input.phone, code);
      return { success: true, fallbackCode: code };
    }),

    verifyOtp: publicProcedure.input(z.object({
      phone: z.string().min(9).max(15),
      code: z.string().length(6),
    })).mutation(async ({ input }) => {
      // Dev: check in-memory store first (bypasses DB timezone issues)
      const devCode = devOtpStore.get(input.phone);
      if (devCode && devCode === input.code) {
        devOtpStore.delete(input.phone);
        return { success: true };
      }
      const valid = await db.verifyOtp(input.phone, input.code);
      if (!valid) return { success: false, error: 'رمز التحقق غير صحيح أو منتهي الصلاحية' };
      return { success: true };
    }),

    register: publicProcedure.input(z.object({
      phone: z.string().min(9).max(15),
      fullName: z.string().min(2).max(255),
      companyName: z.string().max(255).optional(),
      activityType: z.string().max(100).optional(),
      region: z.string().max(100).optional(),
    })).mutation(async ({ input, ctx }) => {
      const openId = `merchant_${input.phone}`;
      await db.upsertUser({
        openId,
        name: input.fullName,
        loginMethod: "otp",
        lastSignedIn: new Date(),
        role: "merchant" as any,
        phone: input.phone,
        company: input.companyName ?? null,
        activityType: input.activityType ?? null,
        region: input.region ?? null,
      });
      const token = await sdk.createSessionToken(openId, { name: input.fullName });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return { success: true };
    }),

    login: publicProcedure.input(z.object({
      phone: z.string().min(9).max(15),
    })).mutation(async ({ input, ctx }) => {
      const openId = `merchant_${input.phone}`;
      const user = await db.getUserByOpenId(openId);
      if (!user) return { success: false, error: "User not found" };
      await db.upsertUser({ openId, lastSignedIn: new Date() });
      const token = await sdk.createSessionToken(openId, { name: user.name || input.phone });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return { success: true, user };
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
