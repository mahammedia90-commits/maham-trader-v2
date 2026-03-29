import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { contractService } from "../services/contract.service";

export const contractsRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    contractService.listByUser(ctx.user.id)),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) =>
      contractService.getByIdForUser(input.id, ctx.user.id)),

  sign: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) =>
      contractService.sign(input.id, ctx.user.id)),
});
