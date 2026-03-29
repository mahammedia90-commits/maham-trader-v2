import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const teamRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    db.listTeamMembers(ctx.user.id)),

  add: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(255),
      email: z.string().email().max(320).optional(),
      phone: z.string().max(20).optional(),
      role: z.string().max(100).optional(),
      permissions: z.array(z.string().max(100)).max(50).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const memberId = await db.createTeamMember({
        ownerId: ctx.user.id, name: input.name, email: input.email ?? null,
        phone: input.phone ?? null, role: input.role ?? null, permissions: input.permissions ?? [],
      });
      return { memberId };
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.removeTeamMember(input.id, ctx.user.id);
      return { success: true };
    }),
});
