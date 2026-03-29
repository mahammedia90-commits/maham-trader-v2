import * as db from "../db";

export const bookingRepository = {
  listByUser(userId: number) {
    return db.listBookingsByUser(userId);
  },

  getById(id: number) {
    return db.getBookingById(id);
  },

  create(data: {
    orderId: string;
    userId: number;
    eventId: number;
    unitId: number;
    totalAmount: string | number;
    notes: string | null;
    status: string;
  }) {
    return db.createBooking(data);
  },

  updateStatus(id: number, status: { status: string }) {
    return db.updateBookingStatus(id, status);
  },

  getEventById(eventId: number) {
    return db.getEventById(eventId);
  },

  getUnitById(unitId: number) {
    return db.getUnitById(unitId);
  },

  updateUnitStatus(unitId: number, status: string) {
    return db.updateUnitStatus(unitId, status);
  },

  getContractById(contractId: number) {
    return db.getContractById(contractId);
  },

  validatePromoCode(code: string, eventId?: number) {
    return db.validatePromoCode(code, eventId);
  },

  createNotification(data: {
    userId: number;
    titleAr: string;
    titleEn: string;
    messageAr: string;
    messageEn: string;
    type: string;
    channel: string;
  }) {
    return db.createNotification(data);
  },

  createAuditLog(data: {
    userId: number;
    action: string;
    entity: string;
    entityId: number;
    details: Record<string, unknown>;
  }) {
    return db.createAuditLog(data);
  },
};
