import { nanoid } from "nanoid";
import { bookingRepository as repo } from "../repositories/booking.repository";
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from "../lib/errors";
import { logger } from "../lib/logger";

export const bookingService = {
  /**
   * List all bookings for a user, enriched with event/unit data.
   */
  async listByUser(userId: number) {
    const bookings = await repo.listByUser(userId);
    return Promise.all(
      bookings.map(async (booking) => {
        const event = await repo.getEventById(booking.eventId);
        const unit = await repo.getUnitById(booking.unitId);
        return { ...booking, event, unit };
      }),
    );
  },

  /**
   * Get a single booking with full details.
   * Enforces ownership — user can only see their own bookings.
   */
  async getByIdForUser(bookingId: number, userId: number) {
    const booking = await repo.getById(bookingId);
    if (!booking) throw new NotFoundError("Booking", bookingId);
    if (booking.userId !== userId) throw new AuthorizationError("Access denied to this booking");

    const event = await repo.getEventById(booking.eventId);
    const unit = await repo.getUnitById(booking.unitId);
    const contract = booking.contractId
      ? await repo.getContractById(booking.contractId)
      : null;

    return { ...booking, event, unit, contract };
  },

  /**
   * Create a new booking.
   * Validates: KYC status, unit availability, event status.
   */
  async create(
    userId: number,
    kycStatus: string,
    input: { eventId: number; unitId: number; notes?: string; promoCode?: string },
  ) {
    // Business rule: KYC must be verified
    if (kycStatus !== "verified") {
      throw new ValidationError(
        "KYC verification required before booking. Please complete your account verification first.",
      );
    }

    // Validate unit exists and is available
    const unit = await repo.getUnitById(input.unitId);
    if (!unit) throw new NotFoundError("Unit", input.unitId);
    if (unit.status !== "available") {
      throw new ValidationError("Unit is not available for booking");
    }

    // Validate event exists and accepts bookings
    const event = await repo.getEventById(input.eventId);
    if (!event) throw new NotFoundError("Event", input.eventId);
    if (event.status !== "upcoming" && event.status !== "active") {
      throw new ValidationError("Event is not accepting bookings");
    }

    // Generate order ID
    const orderId = `MX-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;

    // Create booking
    const bookingId = await repo.create({
      orderId,
      userId,
      eventId: input.eventId,
      unitId: input.unitId,
      totalAmount: unit.price,
      notes: input.notes ?? null,
      status: "pending_review",
    });

    // Reserve the unit
    await repo.updateUnitStatus(input.unitId, "reserved");

    // Notification
    await repo.createNotification({
      userId,
      titleAr: "طلب حجز جديد",
      titleEn: "New Booking Request",
      messageAr: `تم إرسال طلب حجزك للوحدة ${unit.code} بنجاح. سيتم مراجعته من قبل المشرف.`,
      messageEn: `Your booking request for unit ${unit.code} has been submitted. It will be reviewed by a supervisor.`,
      type: "booking",
      channel: "in_app",
    });

    // Audit
    await repo.createAuditLog({
      userId,
      action: "booking.create",
      entity: "bookings",
      entityId: bookingId,
      details: { orderId, unitId: input.unitId, eventId: input.eventId },
    });

    logger.info("Booking created", "BookingService", { bookingId, orderId, userId });

    return { bookingId, orderId };
  },

  /**
   * Cancel a booking.
   * Enforces ownership and validates cancellation is allowed.
   */
  async cancel(bookingId: number, userId: number) {
    const booking = await repo.getById(bookingId);
    if (!booking) throw new NotFoundError("Booking", bookingId);
    if (booking.userId !== userId) throw new AuthorizationError("Access denied to this booking");

    if (booking.status === "paid" || booking.status === "cancelled") {
      throw new ValidationError("Cannot cancel this booking");
    }

    await repo.updateStatus(bookingId, { status: "cancelled" });
    await repo.updateUnitStatus(booking.unitId, "available");

    await repo.createNotification({
      userId,
      titleAr: "تم إلغاء الحجز",
      titleEn: "Booking Cancelled",
      messageAr: `تم إلغاء الحجز رقم ${booking.orderId} بنجاح.`,
      messageEn: `Booking ${booking.orderId} has been cancelled successfully.`,
      type: "booking",
      channel: "in_app",
    });

    await repo.createAuditLog({
      userId,
      action: "booking.cancel",
      entity: "bookings",
      entityId: bookingId,
      details: { orderId: booking.orderId },
    });

    logger.info("Booking cancelled", "BookingService", { bookingId, userId });

    return { success: true };
  },

  /**
   * Validate a promo code.
   */
  async validatePromo(code: string, eventId?: number) {
    const promo = await repo.validatePromoCode(code, eventId);
    if (!promo) return { valid: false as const, message: "Invalid or expired promo code" };
    return {
      valid: true as const,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      code: promo.code,
    };
  },
};
