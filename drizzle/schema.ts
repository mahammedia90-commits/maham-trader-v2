import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
  bigint,
} from "drizzle-orm/mysql-core";

// ============================================================
// 1. USERS - Extended for Maham Expo (Trader Portal)
// ============================================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  company: varchar("company", { length: 255 }),
  activityType: varchar("activityType", { length: 100 }),
  region: varchar("region", { length: 100 }),
  avatar: text("avatar"),
  commercialRegister: varchar("commercialRegister", { length: 50 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "merchant", "investor", "sponsor", "supervisor"]).default("merchant").notNull(),
  kycStatus: mysqlEnum("kycStatus", ["pending", "submitted", "under_review", "verified", "rejected"]).default("pending").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// 2. VENUES - Exhibition Halls / Locations
// ============================================================
export const venues = mysqlTable("venues", {
  id: int("id").autoincrement().primaryKey(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  address: text("address"),
  capacity: int("capacity"),
  mapImage: text("mapImage"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Venue = typeof venues.$inferSelect;
export type InsertVenue = typeof venues.$inferInsert;

// ============================================================
// 3. EVENTS - Exhibitions / Conferences / Expos
// ============================================================
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  venueId: int("venueId").notNull(),
  titleAr: varchar("titleAr", { length: 500 }).notNull(),
  titleEn: varchar("titleEn", { length: 500 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  city: varchar("city", { length: 100 }).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  expectedVisitors: int("expectedVisitors").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  isOfficial: boolean("isOfficial").default(false).notNull(),
  status: mysqlEnum("status", ["draft", "upcoming", "active", "completed", "cancelled"]).default("draft").notNull(),
  image: text("image"),
  totalUnits: int("totalUnits").default(0),
  availableUnits: int("availableUnits").default(0),
  priceRange: varchar("priceRange", { length: 100 }),
  categories: json("categories").$type<string[]>(),
  publishedAt: timestamp("publishedAt"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ============================================================
// 4. ZONES - Areas within an event venue
// ============================================================
export const zones = mysqlTable("zones", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }).notNull(),
  color: varchar("color", { length: 20 }),
  description: text("description"),
  x: decimal("x", { precision: 10, scale: 2 }).default("0"),
  y: decimal("y", { precision: 10, scale: 2 }).default("0"),
  width: decimal("width", { precision: 10, scale: 2 }).default("0"),
  height: decimal("height", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Zone = typeof zones.$inferSelect;
export type InsertZone = typeof zones.$inferInsert;

// ============================================================
// 5. UNITS - Booths / Commercial Spaces
// ============================================================
export const units = mysqlTable("units", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  zoneId: int("zoneId"),
  code: varchar("code", { length: 50 }).notNull(),
  type: mysqlEnum("type", ["standard", "premium", "corner", "island", "kiosk", "outdoor"]).default("standard").notNull(),
  area: decimal("area", { precision: 10, scale: 2 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  pricePerSqm: decimal("pricePerSqm", { precision: 10, scale: 2 }),
  status: mysqlEnum("unitStatus", ["available", "reserved", "sold", "maintenance", "blocked"]).default("available").notNull(),
  x: decimal("unitX", { precision: 10, scale: 2 }).default("0"),
  y: decimal("unitY", { precision: 10, scale: 2 }).default("0"),
  width: decimal("unitWidth", { precision: 10, scale: 2 }).default("0"),
  height: decimal("unitHeight", { precision: 10, scale: 2 }).default("0"),
  amenities: json("amenities").$type<string[]>(),
  trafficScore: int("trafficScore"),
  allowedCategories: json("allowedCategories").$type<string[]>(),
  image: text("unitImage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Unit = typeof units.$inferSelect;
export type InsertUnit = typeof units.$inferInsert;

// ============================================================
// 6. BOOKINGS - Reservation requests with approval workflow
// ============================================================
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  orderId: varchar("orderId", { length: 50 }).notNull().unique(),
  userId: int("userId").notNull(),
  eventId: int("eventId").notNull(),
  unitId: int("unitId").notNull(),
  status: mysqlEnum("bookingStatus", [
    "pending_review",
    "approved",
    "rejected",
    "pending_payment",
    "paid",
    "cancelled",
    "expired",
  ]).default("pending_review").notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  reviewerNote: text("reviewerNote"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  contractId: int("contractId"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ============================================================
// 7. CONTRACTS - Digital contracts with e-signing
// ============================================================
export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  contractNumber: varchar("contractNumber", { length: 50 }).notNull().unique(),
  bookingId: int("bookingId").notNull(),
  userId: int("userId").notNull(),
  eventId: int("eventId"),
  type: mysqlEnum("contractType", ["booth_rental", "sponsorship", "investment", "supply", "employment"]).default("booth_rental").notNull(),
  titleAr: varchar("contractTitleAr", { length: 500 }),
  titleEn: varchar("contractTitleEn", { length: 500 }),
  unitDetails: text("unitDetails"),
  totalAmount: decimal("contractTotalAmount", { precision: 12, scale: 2 }).notNull(),
  terms: json("terms").$type<string[]>(),
  status: mysqlEnum("contractStatus", ["draft", "pending_signature", "signed", "active", "expired", "terminated"]).default("draft").notNull(),
  signedAt: timestamp("signedAt"),
  signedByUser: boolean("signedByUser").default(false),
  signedByAdmin: boolean("signedByAdmin").default(false),
  pdfUrl: text("pdfUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

// ============================================================
// 8. INVOICES - ZATCA compliant invoices
// ============================================================
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  bookingId: int("invoiceBookingId"),
  contractId: int("invoiceContractId"),
  userId: int("invoiceUserId").notNull(),
  type: mysqlEnum("invoiceType", ["booking", "service", "sponsorship", "investment", "refund"]).default("booking").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  vatRate: decimal("vatRate", { precision: 5, scale: 2 }).default("15.00"),
  vatAmount: decimal("vatAmount", { precision: 12, scale: 2 }).notNull(),
  totalAmount: decimal("invoiceTotalAmount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  status: mysqlEnum("invoiceStatus", ["draft", "issued", "paid", "overdue", "cancelled", "refunded"]).default("draft").notNull(),
  dueDate: timestamp("dueDate"),
  paidAt: timestamp("paidAt"),
  zatcaQrCode: text("zatcaQrCode"),
  zatcaHash: varchar("zatcaHash", { length: 255 }),
  pdfUrl: text("invoicePdfUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ============================================================
// 9. PAYMENTS - Payment transactions
// ============================================================
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("paymentInvoiceId").notNull(),
  userId: int("paymentUserId").notNull(),
  amount: decimal("paymentAmount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("paymentCurrency", { length: 10 }).default("SAR"),
  method: mysqlEnum("paymentMethod", ["tap", "stripe", "bank_transfer", "apple_pay", "mada", "visa", "mastercard"]).default("tap").notNull(),
  gateway: varchar("gateway", { length: 50 }),
  gatewayTransactionId: varchar("gatewayTransactionId", { length: 255 }),
  status: mysqlEnum("paymentStatus", ["pending", "processing", "completed", "failed", "refunded", "cancelled"]).default("pending").notNull(),
  paidAt: timestamp("paymentPaidAt"),
  failureReason: text("failureReason"),
  metadata: json("paymentMetadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("paymentCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("paymentUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// ============================================================
// 10. NOTIFICATIONS - Multi-channel notifications
// ============================================================
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("notifUserId").notNull(),
  titleAr: varchar("notifTitleAr", { length: 500 }).notNull(),
  titleEn: varchar("notifTitleEn", { length: 500 }).notNull(),
  messageAr: text("notifMessageAr").notNull(),
  messageEn: text("notifMessageEn").notNull(),
  type: mysqlEnum("notifType", ["booking", "payment", "contract", "system", "kyc", "support", "promotion"]).default("system").notNull(),
  channel: mysqlEnum("notifChannel", ["in_app", "sms", "email", "push", "whatsapp"]).default("in_app").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  actionUrl: varchar("actionUrl", { length: 500 }),
  metadata: json("notifMetadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("notifCreatedAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============================================================
// 11. KYC_DOCUMENTS - Know Your Customer documents
// ============================================================
export const kycDocuments = mysqlTable("kyc_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("kycUserId").notNull(),
  documentType: mysqlEnum("documentType", [
    "commercial_register",
    "national_id",
    "business_license",
    "tax_certificate",
    "bank_statement",
    "other",
  ]).notNull(),
  documentNumber: varchar("documentNumber", { length: 100 }),
  fileUrl: text("kycFileUrl").notNull(),
  fileName: varchar("kycFileName", { length: 255 }),
  status: mysqlEnum("kycDocStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewedBy: int("kycReviewedBy"),
  reviewedAt: timestamp("kycReviewedAt"),
  rejectionReason: text("rejectionReason"),
  expiryDate: timestamp("expiryDate"),
  createdAt: timestamp("kycCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("kycUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = typeof kycDocuments.$inferInsert;

// ============================================================
// 12. REVIEWS - Event and service reviews
// ============================================================
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("reviewUserId").notNull(),
  eventId: int("reviewEventId"),
  bookingId: int("reviewBookingId"),
  rating: int("reviewRating").notNull(),
  comment: text("reviewComment"),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("reviewCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("reviewUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ============================================================
// 13. SUPPORT_TICKETS - Customer support
// ============================================================
export const supportTickets = mysqlTable("support_tickets", {
  id: int("id").autoincrement().primaryKey(),
  ticketNumber: varchar("ticketNumber", { length: 50 }).notNull().unique(),
  userId: int("ticketUserId").notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("ticketMessage").notNull(),
  category: mysqlEnum("ticketCategory", ["booking", "payment", "contract", "technical", "general", "complaint"]).default("general").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("ticketStatus", ["open", "in_progress", "waiting_response", "resolved", "closed"]).default("open").notNull(),
  assignedTo: int("assignedTo"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("ticketCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("ticketUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

// ============================================================
// 14. SUPPORT_MESSAGES - Messages within support tickets
// ============================================================
export const supportMessages = mysqlTable("support_messages", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("smTicketId").notNull(),
  userId: int("smUserId").notNull(),
  message: text("smMessage").notNull(),
  isStaff: boolean("isStaff").default(false).notNull(),
  attachmentUrl: text("smAttachmentUrl"),
  createdAt: timestamp("smCreatedAt").defaultNow().notNull(),
});

export type SupportMessage = typeof supportMessages.$inferSelect;
export type InsertSupportMessage = typeof supportMessages.$inferInsert;

// ============================================================
// 15. SERVICE_ITEMS - Exhibitor services catalog
// ============================================================
export const serviceItems = mysqlTable("service_items", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("serviceEventId"),
  nameAr: varchar("serviceNameAr", { length: 255 }).notNull(),
  nameEn: varchar("serviceNameEn", { length: 255 }).notNull(),
  descriptionAr: text("serviceDescAr"),
  descriptionEn: text("serviceDescEn"),
  category: varchar("serviceCategory", { length: 100 }),
  price: decimal("servicePrice", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("serviceUnit", { length: 50 }).default("piece"),
  image: text("serviceImage"),
  isActive: boolean("serviceIsActive").default(true).notNull(),
  createdAt: timestamp("serviceCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("serviceUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceItem = typeof serviceItems.$inferSelect;
export type InsertServiceItem = typeof serviceItems.$inferInsert;

// ============================================================
// 16. SERVICE_ORDERS - Orders for exhibitor services
// ============================================================
export const serviceOrders = mysqlTable("service_orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("soOrderNumber", { length: 50 }).notNull().unique(),
  userId: int("soUserId").notNull(),
  bookingId: int("soBookingId"),
  items: json("soItems").$type<Array<{ serviceId: number; name: string; price: number; quantity: number; unit: string }>>(),
  totalAmount: decimal("soTotalAmount", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("soStatus", ["pending", "confirmed", "in_progress", "delivered", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("soCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("soUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type InsertServiceOrder = typeof serviceOrders.$inferInsert;

// ============================================================
// 17. TEAM_MEMBERS - Trader's team management
// ============================================================
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("tmOwnerId").notNull(),
  name: varchar("tmName", { length: 255 }).notNull(),
  email: varchar("tmEmail", { length: 320 }),
  phone: varchar("tmPhone", { length: 20 }),
  role: varchar("tmRole", { length: 100 }),
  permissions: json("tmPermissions").$type<string[]>(),
  avatar: text("tmAvatar"),
  isActive: boolean("tmIsActive").default(true).notNull(),
  createdAt: timestamp("tmCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("tmUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

// ============================================================
// 18. AUDIT_LOGS - System audit trail
// ============================================================
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("auditUserId"),
  action: varchar("auditAction", { length: 100 }).notNull(),
  entity: varchar("auditEntity", { length: 100 }).notNull(),
  entityId: int("auditEntityId"),
  details: json("auditDetails").$type<Record<string, unknown>>(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("auditUserAgent"),
  createdAt: timestamp("auditCreatedAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ============================================================
// 19. PROMO_CODES - Discount and promotional codes
// ============================================================
export const promoCodes = mysqlTable("promo_codes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("promoCode", { length: 50 }).notNull().unique(),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).default("percentage").notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  maxUses: int("maxUses"),
  usedCount: int("usedCount").default(0),
  eventId: int("promoEventId"),
  minAmount: decimal("minAmount", { precision: 12, scale: 2 }),
  expiresAt: timestamp("promoExpiresAt"),
  isActive: boolean("promoIsActive").default(true).notNull(),
  createdAt: timestamp("promoCreatedAt").defaultNow().notNull(),
});

export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = typeof promoCodes.$inferInsert;
