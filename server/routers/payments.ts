import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { paymentService } from "../services/payment.service";

export const paymentsRouter = router({
  invoices: protectedProcedure.query(({ ctx }) =>
    paymentService.listInvoices(ctx.user.id),
  ),

  invoiceDetail: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) =>
      paymentService.getInvoiceForUser(input.id, ctx.user.id),
    ),

  list: protectedProcedure.query(({ ctx }) =>
    paymentService.listPayments(ctx.user.id),
  ),

  initiate: protectedProcedure
    .input(z.object({
      invoiceId: z.number(),
      method: z.enum(["tap", "stripe", "bank_transfer", "apple_pay", "mada", "visa", "mastercard"]),
    }))
    .mutation(({ ctx, input }) =>
      paymentService.initiate(ctx.user.id, input),
    ),

  confirm: protectedProcedure
    .input(z.object({
      paymentId: z.number(),
      gatewayTransactionId: z.string().max(255).optional(),
    }))
    .mutation(({ ctx, input }) =>
      paymentService.confirm(ctx.user.id, input),
    ),

  summary: protectedProcedure.query(({ ctx }) =>
    paymentService.summary(ctx.user.id),
  ),
});
