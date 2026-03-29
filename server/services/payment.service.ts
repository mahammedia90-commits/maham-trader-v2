import { paymentRepository as repo } from "../repositories/payment.repository";
import { NotFoundError, AuthorizationError, ValidationError } from "../lib/errors";
import { logger } from "../lib/logger";

export const paymentService = {
  async listInvoices(userId: number) {
    return repo.listInvoicesByUser(userId);
  },

  async getInvoiceForUser(invoiceId: number, userId: number) {
    const invoice = await repo.getInvoiceById(invoiceId);
    if (!invoice) throw new NotFoundError("Invoice", invoiceId);
    if (invoice.userId !== userId) throw new AuthorizationError("Access denied to this invoice");
    return invoice;
  },

  async listPayments(userId: number) {
    const payments = await repo.listPaymentsByUser(userId);
    return Promise.all(
      payments.map(async (payment) => {
        const invoice = await repo.getInvoiceById(payment.invoiceId);
        return { ...payment, invoice };
      }),
    );
  },

  async initiate(userId: number, input: { invoiceId: number; method: string }) {
    const invoice = await repo.getInvoiceById(input.invoiceId);
    if (!invoice) throw new NotFoundError("Invoice", input.invoiceId);
    if (invoice.userId !== userId) throw new AuthorizationError("Access denied to this invoice");
    if (invoice.status !== "issued" && invoice.status !== "overdue") {
      throw new ValidationError("Invoice is not payable");
    }

    const paymentId = await repo.createPayment({
      invoiceId: input.invoiceId,
      userId,
      amount: invoice.totalAmount,
      currency: invoice.currency ?? "SAR",
      method: input.method,
      status: "pending",
    });

    await repo.createAuditLog({
      userId,
      action: "payment.initiate",
      entity: "payments",
      entityId: paymentId,
      details: { invoiceId: input.invoiceId, method: input.method, amount: invoice.totalAmount },
    });

    logger.info("Payment initiated", "PaymentService", { paymentId, userId });

    return {
      paymentId,
      amount: invoice.totalAmount,
      currency: invoice.currency ?? "SAR",
      method: input.method,
      status: "pending",
    };
  },

  async confirm(userId: number, input: { paymentId: number; gatewayTransactionId?: string }) {
    const payment = await repo.getPaymentById(input.paymentId);
    if (!payment) throw new NotFoundError("Payment", input.paymentId);
    if (payment.userId !== userId) throw new AuthorizationError("Access denied to this payment");
    if (payment.status !== "pending" && payment.status !== "processing") {
      throw new ValidationError("Payment cannot be confirmed");
    }

    await repo.updatePayment(input.paymentId, {
      status: "completed",
      paidAt: new Date(),
      gatewayTransactionId: input.gatewayTransactionId ?? null,
    });

    await repo.updateInvoice(payment.invoiceId, { status: "paid", paidAt: new Date() });

    const invoice = await repo.getInvoiceById(payment.invoiceId);
    if (invoice?.bookingId) {
      await repo.updateBookingStatus(invoice.bookingId, { status: "paid" });
    }

    await repo.createNotification({
      userId,
      titleAr: "تم الدفع بنجاح",
      titleEn: "Payment Successful",
      messageAr: `تم تأكيد الدفع بمبلغ ${payment.amount} ${payment.currency} بنجاح.`,
      messageEn: `Payment of ${payment.amount} ${payment.currency} has been confirmed.`,
      type: "payment",
      channel: "in_app",
    });

    await repo.createAuditLog({
      userId,
      action: "payment.confirm",
      entity: "payments",
      entityId: input.paymentId,
      details: { amount: payment.amount, currency: payment.currency },
    });

    logger.info("Payment confirmed", "PaymentService", { paymentId: input.paymentId, userId });

    return { success: true };
  },

  async summary(userId: number) {
    const invoices = await repo.listInvoicesByUser(userId);
    const totalPaid = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const totalPending = invoices.filter(i => i.status === "issued" || i.status === "overdue").reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((sum, i) => sum + Number(i.totalAmount), 0);
    return { totalPaid, totalPending, totalOverdue, invoiceCount: invoices.length };
  },
};
