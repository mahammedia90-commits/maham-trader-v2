import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const analyticsRouter = router({
  // Get trader dashboard stats
  stats: protectedProcedure.query(async ({ ctx }) => {
    return db.getTraderStats(ctx.user.id);
  }),

  // Get trader profile completion
  profileCompletion: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    const fields = [
      { key: "name", filled: !!user.name },
      { key: "email", filled: !!user.email },
      { key: "phone", filled: !!(user as any).phone },
      { key: "company", filled: !!(user as any).company },
      { key: "activityType", filled: !!(user as any).activityType },
      { key: "region", filled: !!(user as any).region },
      { key: "kycStatus", filled: (user as any).kycStatus === "verified" },
    ];
    const filled = fields.filter(f => f.filled).length;
    return {
      percentage: Math.round((filled / fields.length) * 100),
      fields,
    };
  }),
});
