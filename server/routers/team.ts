import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const teamRouter = router({
  // List team members
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.listTeamMembers(ctx.user.id);
  }),

  // Add team member
  add: protectedProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      role: z.string().optional(),
      permissions: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const memberId = await db.createTeamMember({
        ownerId: ctx.user.id,
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        role: input.role ?? null,
        permissions: input.permissions ?? [],
      });
      return { memberId };
    }),

  // Remove team member
  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.removeTeamMember(input.id, ctx.user.id);
      return { success: true };
    }),
});
