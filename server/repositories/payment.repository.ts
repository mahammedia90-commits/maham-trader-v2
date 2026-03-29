import * as db from "../db";

export const paymentRepository = {
  listInvoicesByUser: (userId: number) => db.listInvoicesByUser(userId),
  getInvoiceById: (id: number) => db.getInvoiceById(id),
  updateInvoice: (id: number, data: Record<string, unknown>) => db.updateInvoice(id, data),

  listPaymentsByUser: (userId: number) => db.listPaymentsByUser(userId),
  getPaymentById: (id: number) => db.getPaymentById(id),
  createPayment: (data: {
    invoiceId: number; userId: number; amount: string | number;
    currency: string; method: string; status: string;
  }) => db.createPayment(data),
  updatePayment: (id: number, data: Record<string, unknown>) => db.updatePayment(id, data),

  updateBookingStatus: (id: number, status: { status: string }) => db.updateBookingStatus(id, status),
  createNotification: (data: {
    userId: number; titleAr: string; titleEn: string;
    messageAr: string; messageEn: string; type: string; channel: string;
  }) => db.createNotification(data),
  createAuditLog: (data: {
    userId: number; action: string; entity: string;
    entityId: number; details: Record<string, unknown>;
  }) => db.createAuditLog(data),
};
