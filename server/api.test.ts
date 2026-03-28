import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// Mock db module to avoid real database calls
vi.mock("./db", () => ({
  getUserByOpenId: vi.fn(),
  getUserById: vi.fn(),
  updateUserProfile: vi.fn(),
  listEvents: vi.fn().mockResolvedValue([
    {
      id: 1,
      titleAr: "معرض الرياض الدولي",
      titleEn: "Riyadh International Expo",
      status: "upcoming",
      city: "الرياض",
      startDate: new Date("2026-05-15"),
      endDate: new Date("2026-05-20"),
    },
    {
      id: 2,
      titleAr: "معرض جدة الغذائي",
      titleEn: "Jeddah Food Expo",
      status: "upcoming",
      city: "جدة",
      startDate: new Date("2026-06-10"),
      endDate: new Date("2026-06-14"),
    },
  ]),
  getEventById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return {
      id: 1, titleAr: "معرض الرياض الدولي", titleEn: "Riyadh International Expo",
      status: "upcoming", venueId: 1, city: "الرياض",
      startDate: new Date("2026-05-15"), endDate: new Date("2026-05-20"),
    };
    return undefined;
  }),
  getVenueById: vi.fn().mockResolvedValue({ id: 1, nameAr: "مركز الرياض", nameEn: "Riyadh Center" }),
  listZonesByEvent: vi.fn().mockResolvedValue([
    { id: 1, eventId: 1, nameAr: "المنطقة A", nameEn: "Zone A" },
  ]),
  listUnitsByEvent: vi.fn().mockResolvedValue([
    { id: 1, eventId: 1, code: "A-001", type: "premium", price: 75000, status: "available" },
    { id: 2, eventId: 1, code: "A-002", type: "standard", price: 35000, status: "available" },
  ]),
  getUnitById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return { id: 1, eventId: 1, code: "A-001", type: "premium", price: 75000, status: "available" };
    if (id === 99) return { id: 99, eventId: 1, code: "A-099", type: "standard", price: 35000, status: "reserved" };
    return undefined;
  }),
  listVenues: vi.fn().mockResolvedValue([{ id: 1, nameAr: "مركز الرياض", nameEn: "Riyadh Center" }]),
  listReviewsByEvent: vi.fn().mockResolvedValue([]),
  createBooking: vi.fn().mockResolvedValue(1),
  listBookingsByUser: vi.fn().mockResolvedValue([
    { id: 1, orderId: "MX-2026-ABC", userId: 1, eventId: 1, unitId: 1, status: "pending_review", totalAmount: 75000 },
  ]),
  getBookingById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return { id: 1, orderId: "MX-2026-ABC", userId: 1, eventId: 1, unitId: 1, status: "pending_review", totalAmount: 75000 };
    if (id === 2) return { id: 2, orderId: "MX-2026-DEF", userId: 1, eventId: 1, unitId: 2, status: "paid" };
    return undefined;
  }),
  updateBookingStatus: vi.fn(),
  updateUnitStatus: vi.fn(),
  createContract: vi.fn().mockResolvedValue(1),
  listContractsByUser: vi.fn().mockResolvedValue([]),
  getContractById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return {
      id: 1, contractNumber: "C-001", userId: 1, bookingId: 1, eventId: 1,
      status: "pending_signature", signedByUser: false, signedByAdmin: false,
    };
    return undefined;
  }),
  updateContract: vi.fn(),
  listInvoicesByUser: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, status: "issued", totalAmount: 75000, currency: "SAR" },
  ]),
  getInvoiceById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return { id: 1, userId: 1, bookingId: 1, status: "issued", totalAmount: 75000, currency: "SAR" };
    return undefined;
  }),
  updateInvoice: vi.fn(),
  createPayment: vi.fn().mockResolvedValue(1),
  listPaymentsByUser: vi.fn().mockResolvedValue([]),
  getPaymentById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return { id: 1, invoiceId: 1, userId: 1, amount: 75000, currency: "SAR", status: "pending" };
    return undefined;
  }),
  updatePayment: vi.fn(),
  createNotification: vi.fn().mockResolvedValue(1),
  listNotificationsByUser: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, titleAr: "إشعار", titleEn: "Notification", isRead: false },
  ]),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  countUnreadNotifications: vi.fn().mockResolvedValue(3),
  createKycDocument: vi.fn().mockResolvedValue(1),
  listKycDocumentsByUser: vi.fn().mockResolvedValue([]),
  createSupportTicket: vi.fn().mockResolvedValue(1),
  listSupportTicketsByUser: vi.fn().mockResolvedValue([]),
  createSupportMessage: vi.fn().mockResolvedValue(1),
  listSupportMessagesByTicket: vi.fn().mockResolvedValue([]),
  listServiceItems: vi.fn().mockResolvedValue([
    { id: 1, serviceNameAr: "كهرباء", serviceNameEn: "Electricity", servicePrice: 500 },
  ]),
  createServiceOrder: vi.fn().mockResolvedValue(1),
  listServiceOrdersByUser: vi.fn().mockResolvedValue([]),
  listTeamMembers: vi.fn().mockResolvedValue([]),
  createTeamMember: vi.fn().mockResolvedValue(1),
  removeTeamMember: vi.fn(),
  listReviewsByUser: vi.fn().mockResolvedValue([]),
  createReview: vi.fn().mockResolvedValue(1),
  getTraderStats: vi.fn().mockResolvedValue({ totalBookings: 5, activeBookings: 2, totalSpent: 250000, pendingPayments: 75000 }),
  createAuditLog: vi.fn(),
  validatePromoCode: vi.fn().mockImplementation(async (code: string) => {
    if (code === "MAHAM2026") return { code: "MAHAM2026", discountType: "percentage", discountValue: 10 };
    return null;
  }),
  createInvoice: vi.fn().mockResolvedValue(1),
  upsertUser: vi.fn(),
}));

// Helper to create authenticated context
function createAuthContext(overrides?: Partial<User>): TrpcContext {
  const user: User = {
    id: 1,
    openId: "test-user-123",
    email: "trader@mahamexpo.sa",
    name: "Test Trader",
    loginMethod: "manus",
    role: "user",
    phone: "+966535555900",
    company: "شركة تجارية",
    activityType: "تجارة عامة",
    region: "الرياض",
    avatar: null,
    commercialRegister: "1234567890",
    kycStatus: "verified",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  } as User;

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ============================================================
// EVENTS API TESTS
// ============================================================
describe("events", () => {
  it("lists events publicly without auth", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.events.list();
    expect(result).toHaveLength(2);
    expect(result[0].titleEn).toBe("Riyadh International Expo");
  });

  it("gets event by ID", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.events.getById({ id: 1 });
    expect(result.id).toBe(1);
    expect(result.titleAr).toBe("معرض الرياض الدولي");
  });

  it("throws for non-existent event", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.events.getById({ id: 999 })).rejects.toThrow("Event not found");
  });

  it("gets event detail with venue and zones", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.events.getDetail({ id: 1 });
    expect(result.event.id).toBe(1);
    expect(result.venue).toBeDefined();
    expect(result.zones).toHaveLength(1);
    expect(result.units).toHaveLength(2);
  });

  it("lists units for an event", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.events.units({ eventId: 1 });
    expect(result).toHaveLength(2);
    expect(result[0].code).toBe("A-001");
  });

  it("lists venues", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.events.venues();
    expect(result).toHaveLength(1);
  });
});

// ============================================================
// BOOKINGS API TESTS
// ============================================================
describe("bookings", () => {
  it("lists bookings for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.bookings.list();
    expect(result).toHaveLength(1);
    expect(result[0].orderId).toBe("MX-2026-ABC");
  });

  it("creates a booking for verified user", async () => {
    const ctx = createAuthContext({ kycStatus: "verified" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.bookings.create({ eventId: 1, unitId: 1 });
    expect(result.bookingId).toBe(1);
    expect(result.orderId).toBeDefined();
    expect(result.orderId).toMatch(/^MX-2026-/);
  });

  it("rejects booking for unverified user", async () => {
    const ctx = createAuthContext({ kycStatus: "pending" });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.bookings.create({ eventId: 1, unitId: 1 }))
      .rejects.toThrow("KYC verification required");
  });

  it("rejects booking for unavailable unit", async () => {
    const ctx = createAuthContext({ kycStatus: "verified" });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.bookings.create({ eventId: 1, unitId: 99 }))
      .rejects.toThrow("Unit is not available");
  });

  it("cancels a pending booking", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.bookings.cancel({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects cancelling a paid booking", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.bookings.cancel({ id: 2 })).rejects.toThrow("Cannot cancel");
  });

  it("validates a valid promo code", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.bookings.validatePromo({ code: "MAHAM2026" });
    expect(result.valid).toBe(true);
    expect(result.discountValue).toBe(10);
  });

  it("rejects invalid promo code", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.bookings.validatePromo({ code: "INVALID" });
    expect(result.valid).toBe(false);
  });
});

// ============================================================
// CONTRACTS API TESTS
// ============================================================
describe("contracts", () => {
  it("lists contracts for user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.contracts.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("signs a pending contract", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.contracts.sign({ id: 1 });
    expect(result.success).toBe(true);
  });
});

// ============================================================
// PAYMENTS API TESTS
// ============================================================
describe("payments", () => {
  it("lists invoices for user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.payments.invoices();
    expect(result).toHaveLength(1);
    expect(result[0].totalAmount).toBe(75000);
  });

  it("initiates payment for an invoice", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.payments.initiate({ invoiceId: 1, method: "mada" });
    expect(result.paymentId).toBe(1);
    expect(result.amount).toBe(75000);
    expect(result.currency).toBe("SAR");
  });

  it("confirms a pending payment", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.payments.confirm({ paymentId: 1 });
    expect(result.success).toBe(true);
  });

  it("gets payment summary", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.payments.summary();
    expect(result).toHaveProperty("totalPaid");
    expect(result).toHaveProperty("totalPending");
    expect(result.invoiceCount).toBe(1);
  });
});

// ============================================================
// NOTIFICATIONS API TESTS
// ============================================================
describe("notifications", () => {
  it("lists notifications", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.list();
    expect(result).toHaveLength(1);
  });

  it("gets unread count", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.unreadCount();
    expect(result).toBe(3);
  });

  it("marks notification as read", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.markRead({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("marks all as read", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.markAllRead();
    expect(result.success).toBe(true);
  });
});

// ============================================================
// KYC API TESTS
// ============================================================
describe("kyc", () => {
  it("gets KYC status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.kyc.status();
    expect(result.kycStatus).toBe("verified");
    expect(Array.isArray(result.documents)).toBe(true);
  });

  it("submits KYC document", async () => {
    const ctx = createAuthContext({ kycStatus: "pending" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.kyc.submit({
      documentType: "commercial_register",
      fileUrl: "https://storage.example.com/doc.pdf",
      fileName: "commercial_register.pdf",
    });
    expect(result.documentId).toBe(1);
  });
});

// ============================================================
// SUPPORT API TESTS
// ============================================================
describe("support", () => {
  it("creates a support ticket", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.support.create({
      subject: "مشكلة في الحجز",
      message: "لا أستطيع إتمام عملية الحجز، يظهر خطأ عند الدفع",
      category: "booking",
      priority: "high",
    });
    expect(result.ticketId).toBe(1);
    expect(result.ticketNumber).toMatch(/^TK-/);
  });

  it("lists support tickets", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.support.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ============================================================
// SERVICES API TESTS
// ============================================================
describe("services", () => {
  it("lists service items publicly", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.services.list();
    expect(result).toHaveLength(1);
    expect(result[0].serviceNameAr).toBe("كهرباء");
  });

  it("creates a service order", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.services.order({
      items: [{ serviceId: 1, name: "كهرباء إضافية", price: 500, quantity: 2, unit: "نقطة" }],
    });
    expect(result.orderId).toBe(1);
    expect(result.totalAmount).toBe(1000);
  });
});

// ============================================================
// TEAM API TESTS
// ============================================================
describe("team", () => {
  it("adds a team member", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.team.add({
      name: "أحمد محمد",
      email: "ahmed@company.sa",
      phone: "+966501234567",
      role: "مدير مبيعات",
    });
    expect(result.memberId).toBe(1);
  });

  it("lists team members", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.team.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ============================================================
// ANALYTICS API TESTS
// ============================================================
describe("analytics", () => {
  it("gets trader stats", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.analytics.stats();
    expect(result.totalBookings).toBe(5);
    expect(result.activeBookings).toBe(2);
    expect(result.totalSpent).toBe(250000);
    expect(result.pendingPayments).toBe(75000);
  });

  it("gets profile completion", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.analytics.profileCompletion();
    expect(result.percentage).toBeGreaterThan(0);
    expect(result.fields).toBeDefined();
  });
});

// ============================================================
// AUTH PROFILE UPDATE TESTS
// ============================================================
describe("auth.updateProfile", () => {
  it("updates trader profile", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.updateProfile({
      name: "نور كرم",
      company: "شركة محام",
    });
    expect(result.success).toBe(true);
  });
});
