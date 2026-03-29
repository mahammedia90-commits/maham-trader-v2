import { eq, desc, and, sql, inArray, like, or, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, otpCodes,
  venues, InsertVenue,
  events, InsertEvent,
  zones, InsertZone,
  units, InsertUnit,
  bookings, InsertBooking,
  contracts, InsertContract,
  invoices, InsertInvoice,
  payments, InsertPayment,
  notifications, InsertNotification,
  kycDocuments, InsertKycDocument,
  reviews, InsertReview,
  supportTickets, InsertSupportTicket,
  supportMessages, InsertSupportMessage,
  serviceItems, InsertServiceItem,
  serviceOrders, InsertServiceOrder,
  teamMembers, InsertTeamMember,
  auditLogs, InsertAuditLog,
  promoCodes,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================
// USER QUERIES
// ============================================================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "company", "activityType", "region", "avatar", "commercialRegister"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      (values as any)[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (user.kycStatus !== undefined) { values.kycStatus = user.kycStatus; updateSet.kycStatus = user.kycStatus; }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ============================================================
// EVENT QUERIES
// ============================================================
export async function listEvents(filters?: { status?: string; city?: string; search?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.status) conditions.push(eq(events.status, filters.status as any));
  if (filters?.city) conditions.push(eq(events.city, filters.city));
  if (filters?.search) conditions.push(or(like(events.titleAr, `%${filters.search}%`), like(events.titleEn, `%${filters.search}%`)));

  const query = conditions.length > 0
    ? db.select().from(events).where(and(...conditions)).orderBy(desc(events.startDate))
    : db.select().from(events).orderBy(desc(events.startDate));
  return query;
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(events).values(data);
  return result[0].insertId;
}

// ============================================================
// VENUE QUERIES
// ============================================================
export async function listVenues() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(venues).where(eq(venues.isActive, true));
}

export async function getVenueById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(venues).where(eq(venues.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// ZONE QUERIES
// ============================================================
export async function listZonesByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(zones).where(eq(zones.eventId, eventId));
}

// ============================================================
// UNIT QUERIES
// ============================================================
export async function listUnitsByEvent(eventId: number, filters?: { zoneId?: number; status?: string; type?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(units.eventId, eventId)];
  if (filters?.zoneId) conditions.push(eq(units.zoneId, filters.zoneId));
  if (filters?.status) conditions.push(eq(units.status, filters.status as any));
  if (filters?.type) conditions.push(eq(units.type, filters.type as any));
  return db.select().from(units).where(and(...conditions));
}

export async function getUnitById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(units).where(eq(units.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUnitStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(units).set({ status: status as any }).where(eq(units.id, id));
}

// ============================================================
// BOOKING QUERIES
// ============================================================
export async function createBooking(data: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookings).values(data);
  return result[0].insertId;
}

export async function listBookingsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBookingStatus(id: number, data: Partial<InsertBooking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bookings).set(data).where(eq(bookings.id, id));
}

// ============================================================
// CONTRACT QUERIES
// ============================================================
export async function createContract(data: InsertContract) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contracts).values(data);
  return result[0].insertId;
}

export async function listContractsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contracts).where(eq(contracts.userId, userId)).orderBy(desc(contracts.createdAt));
}

export async function getContractById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contracts).where(eq(contracts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateContract(id: number, data: Partial<InsertContract>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contracts).set(data).where(eq(contracts.id, id));
}

// ============================================================
// INVOICE QUERIES
// ============================================================
export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(invoices).values(data);
  return result[0].insertId;
}

export async function listInvoicesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt));
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateInvoice(id: number, data: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(invoices).set(data).where(eq(invoices.id, id));
}

// ============================================================
// PAYMENT QUERIES
// ============================================================
export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payments).values(data);
  return result[0].insertId;
}

export async function listPaymentsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
}

export async function getPaymentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePayment(id: number, data: Partial<InsertPayment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(payments).set(data).where(eq(payments.id, id));
}

// ============================================================
// NOTIFICATION QUERIES
// ============================================================
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return result[0].insertId;
}

export async function listNotificationsByUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit);
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

export async function countUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result[0]?.count ?? 0;
}

// ============================================================
// KYC DOCUMENT QUERIES
// ============================================================
export async function createKycDocument(data: InsertKycDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(kycDocuments).values(data);
  return result[0].insertId;
}

export async function listKycDocumentsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(kycDocuments).where(eq(kycDocuments.userId, userId)).orderBy(desc(kycDocuments.createdAt));
}

// ============================================================
// REVIEW QUERIES
// ============================================================
export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(reviews).values(data);
  return result[0].insertId;
}

export async function listReviewsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.userId, userId)).orderBy(desc(reviews.createdAt));
}

export async function listReviewsByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.eventId, eventId)).orderBy(desc(reviews.createdAt));
}

// ============================================================
// SUPPORT TICKET QUERIES
// ============================================================
export async function createSupportTicket(data: InsertSupportTicket) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(supportTickets).values(data);
  return result[0].insertId;
}

export async function listSupportTicketsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt));
}

export async function createSupportMessage(data: InsertSupportMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(supportMessages).values(data);
  return result[0].insertId;
}

export async function listSupportMessagesByTicket(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportMessages).where(eq(supportMessages.ticketId, ticketId)).orderBy(supportMessages.createdAt);
}

// ============================================================
// SERVICE QUERIES
// ============================================================
export async function listServiceItems(eventId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(serviceItems.isActive, true)];
  if (eventId) conditions.push(eq(serviceItems.eventId, eventId));
  return db.select().from(serviceItems).where(and(...conditions));
}

export async function createServiceOrder(data: InsertServiceOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(serviceOrders).values(data);
  return result[0].insertId;
}

export async function listServiceOrdersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceOrders).where(eq(serviceOrders.userId, userId)).orderBy(desc(serviceOrders.createdAt));
}

// ============================================================
// TEAM MEMBER QUERIES
// ============================================================
export async function listTeamMembers(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teamMembers).where(and(eq(teamMembers.ownerId, ownerId), eq(teamMembers.isActive, true)));
}

export async function createTeamMember(data: InsertTeamMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(teamMembers).values(data);
  return result[0].insertId;
}

export async function removeTeamMember(id: number, ownerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(teamMembers).set({ isActive: false }).where(and(eq(teamMembers.id, id), eq(teamMembers.ownerId, ownerId)));
}

// ============================================================
// AUDIT LOG QUERIES
// ============================================================
export async function createAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values(data);
}

// ============================================================
// ANALYTICS QUERIES (for trader dashboard)
// ============================================================
export async function getTraderStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalBookings: 0, activeBookings: 0, totalSpent: 0, pendingPayments: 0 };

  const [bookingStats] = await db.select({
    total: sql<number>`count(*)`,
    active: sql<number>`sum(case when ${bookings.status} in ('approved', 'paid') then 1 else 0 end)`,
    totalAmount: sql<number>`coalesce(sum(${bookings.totalAmount}), 0)`,
  }).from(bookings).where(eq(bookings.userId, userId));

  const [paymentStats] = await db.select({
    pending: sql<number>`coalesce(sum(case when ${invoices.status} in ('issued', 'overdue') then ${invoices.totalAmount} else 0 end), 0)`,
  }).from(invoices).where(eq(invoices.userId, userId));

  return {
    totalBookings: bookingStats?.total ?? 0,
    activeBookings: bookingStats?.active ?? 0,
    totalSpent: bookingStats?.totalAmount ?? 0,
    pendingPayments: paymentStats?.pending ?? 0,
  };
}

// ============================================================
// PROMO CODE QUERIES
// ============================================================
export async function validatePromoCode(code: string, eventId?: number) {
  const db = await getDb();
  if (!db) return null;
  const conditions = [eq(promoCodes.code, code), eq(promoCodes.isActive, true)];
  const result = await db.select().from(promoCodes).where(and(...conditions)).limit(1);
  if (result.length === 0) return null;
  const promo = result[0];
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return null;
  if (promo.maxUses && promo.usedCount !== null && promo.usedCount >= promo.maxUses) return null;
  if (promo.eventId && eventId && promo.eventId !== eventId) return null;
  return promo;
}

// === OTP ===
export async function createOtp(phone: string, code: string) {
  const db = await getDb();
  if (!db) return;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await db.insert(otpCodes).values({ phone, code, expiresAt });
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const now = new Date();
  const result = await db.select().from(otpCodes)
    .where(and(
      eq(otpCodes.phone, phone),
      eq(otpCodes.code, code),
      eq(otpCodes.verified, 0),
      gte(otpCodes.expiresAt, now)
    ))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);
  if (result.length === 0) return false;
  await db.update(otpCodes).set({ verified: 1 }).where(eq(otpCodes.id, result[0].id));
  return true;
}
