import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const paymentsRouter = router({
  // List trader's invoices
  invoices: protectedProcedure.query(async ({ ctx }) => {
    return db.listInvoicesByUser(ctx.user.id);
  }),

  // Get invoice detail
  invoiceDetail: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const invoice = await db.getInvoiceById(input.id);
      if (!invoice || invoice.userId !== ctx.user.id) throw new Error("Invoice not found");
      return invoice;
    }),

  // List trader's payments
  list: protectedProcedure.query(async ({ ctx }) => {
    const userPayments = await db.listPaymentsByUser(ctx.user.id);
    // Enrich with invoice info
    const enriched = await Promise.all(
      userPayments.map(async (payment) => {
        const invoice = await db.getInvoiceById(payment.invoiceId);
        return { ...payment, invoice };
      })
    );
    return enriched;
  }),

  // Initiate payment for an invoice
  initiate: protectedProcedure
    .input(z.object({
      invoiceId: z.number(),
      method: z.enum(["tap", "stripe", "bank_transfer", "apple_pay", "mada", "visa", "mastercard"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await db.getInvoiceById(input.invoiceId);
      if (!invoice || invoice.userId !== ctx.user.id) throw new Error("Invoice not found");
      if (invoice.status !== "issued" && invoice.status !== "overdue") {
        throw new Error("Invoice is not payable");
      }

      // Create payment record
      const paymentId = await db.createPayment({
        invoiceId: input.invoiceId,
        userId: ctx.user.id,
        amount: invoice.totalAmount,
        currency: invoice.currency ?? "SAR",
        method: input.method,
        status: "pending",
      });

      // In production, this would redirect to payment gateway (Tap/Stripe)
      // For now, we return a payment reference
      await db.createAuditLog({
        userId: ctx.user.id,
        action: "payment.initiate",
        entity: "payments",
        entityId: paymentId,
        details: { invoiceId: input.invoiceId, method: input.method, amount: invoice.totalAmount },
      });

      return {
        paymentId,
        amount: invoice.totalAmount,
        currency: invoice.currency ?? "SAR",
        method: input.method,
        // In production: paymentUrl would be the gateway redirect URL
        status: "pending",
      };
    }),

  // Confirm payment (webhook simulation / manual confirmation)
  confirm: protectedProcedure
    .input(z.object({
      paymentId: z.number(),
      gatewayTransactionId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const payment = await db.getPaymentById(input.paymentId);
      if (!payment || payment.userId !== ctx.user.id) throw new Error("Payment not found");
      if (payment.status !== "pending" && payment.status !== "processing") {
        throw new Error("Payment cannot be confirmed");
      }

      // Update payment
      await db.updatePayment(input.paymentId, {
        status: "completed",
        paidAt: new Date(),
        gatewayTransactionId: input.gatewayTransactionId ?? null,
      });

      // Update invoice
      await db.updateInvoice(payment.invoiceId, {
        status: "paid",
        paidAt: new Date(),
      });

      // Update booking status if linked
      const invoice = await db.getInvoiceById(payment.invoiceId);
      if (invoice?.bookingId) {
        await db.updateBookingStatus(invoice.bookingId, { status: "paid" });
      }

      // Notification
      await db.createNotification({
        userId: ctx.user.id,
        titleAr: "تم الدفع بنجاح",
        titleEn: "Payment Successful",
        messageAr: `تم تأكيد الدفع بمبلغ ${payment.amount} ${payment.currency} بنجاح.`,
        messageEn: `Payment of ${payment.amount} ${payment.currency} has been confirmed.`,
        type: "payment",
        channel: "in_app",
      });

      await db.createAuditLog({
        userId: ctx.user.id,
        action: "payment.confirm",
        entity: "payments",
        entityId: input.paymentId,
        details: { amount: payment.amount, currency: payment.currency },
      });

      return { success: true };
    }),

  // Get payment summary stats
  summary: protectedProcedure.query(async ({ ctx }) => {
    const invoicesList = await db.listInvoicesByUser(ctx.user.id);
    const totalPaid = invoicesList.filter(i => i.status === "paid").reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const totalPending = invoicesList.filter(i => i.status === "issued" || i.status === "overdue").reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const totalOverdue = invoicesList.filter(i => i.status === "overdue").reduce((sum, i) => sum + Number(i.totalAmount), 0);
    return { totalPaid, totalPending, totalOverdue, invoiceCount: invoicesList.length };
  }),
});
