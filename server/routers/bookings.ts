import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";
import { nanoid } from "nanoid";

export const bookingsRouter = router({
  // List trader's bookings
  list: protectedProcedure.query(async ({ ctx }) => {
    const userBookings = await db.listBookingsByUser(ctx.user.id);
    // Enrich with event and unit info
    const enriched = await Promise.all(
      userBookings.map(async (booking) => {
        const event = await db.getEventById(booking.eventId);
        const unit = await db.getUnitById(booking.unitId);
        return { ...booking, event, unit };
      })
    );
    return enriched;
  }),

  // Get single booking detail
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const booking = await db.getBookingById(input.id);
      if (!booking || booking.userId !== ctx.user.id) throw new Error("Booking not found");
      const event = await db.getEventById(booking.eventId);
      const unit = await db.getUnitById(booking.unitId);
      const contract = booking.contractId ? await db.getContractById(booking.contractId) : null;
      return { ...booking, event, unit, contract };
    }),

  // Create new booking request (requires KYC verification)
  create: protectedProcedure
    .input(z.object({
      eventId: z.number(),
      unitId: z.number(),
      notes: z.string().optional(),
      promoCode: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check KYC status
      if (ctx.user.kycStatus !== "verified") {
        throw new Error("KYC verification required before booking. Please complete your account verification first.");
      }

      // Check unit availability
      const unit = await db.getUnitById(input.unitId);
      if (!unit) throw new Error("Unit not found");
      if (unit.status !== "available") throw new Error("Unit is not available for booking");

      // Check event exists and is active
      const event = await db.getEventById(input.eventId);
      if (!event) throw new Error("Event not found");
      if (event.status !== "upcoming" && event.status !== "active") {
        throw new Error("Event is not accepting bookings");
      }

      // Generate order ID
      const orderId = `MX-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;

      // Create booking
      const bookingId = await db.createBooking({
        orderId,
        userId: ctx.user.id,
        eventId: input.eventId,
        unitId: input.unitId,
        totalAmount: unit.price,
        notes: input.notes ?? null,
        status: "pending_review",
      });

      // Reserve the unit
      await db.updateUnitStatus(input.unitId, "reserved");

      // Create notification
      await db.createNotification({
        userId: ctx.user.id,
        titleAr: "طلب حجز جديد",
        titleEn: "New Booking Request",
        messageAr: `تم إرسال طلب حجزك للوحدة ${unit.code} بنجاح. سيتم مراجعته من قبل المشرف.`,
        messageEn: `Your booking request for unit ${unit.code} has been submitted. It will be reviewed by a supervisor.`,
        type: "booking",
        channel: "in_app",
      });

      // Audit log
      await db.createAuditLog({
        userId: ctx.user.id,
        action: "booking.create",
        entity: "bookings",
        entityId: bookingId,
        details: { orderId, unitId: input.unitId, eventId: input.eventId },
      });

      return { bookingId, orderId };
    }),

  // Cancel a booking
  cancel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const booking = await db.getBookingById(input.id);
      if (!booking || booking.userId !== ctx.user.id) throw new Error("Booking not found");
      if (booking.status === "paid" || booking.status === "cancelled") {
        throw new Error("Cannot cancel this booking");
      }

      await db.updateBookingStatus(input.id, { status: "cancelled" });
      // Release the unit
      await db.updateUnitStatus(booking.unitId, "available");

      // Notification
      await db.createNotification({
        userId: ctx.user.id,
        titleAr: "تم إلغاء الحجز",
        titleEn: "Booking Cancelled",
        messageAr: `تم إلغاء الحجز رقم ${booking.orderId} بنجاح.`,
        messageEn: `Booking ${booking.orderId} has been cancelled successfully.`,
        type: "booking",
        channel: "in_app",
      });

      await db.createAuditLog({
        userId: ctx.user.id,
        action: "booking.cancel",
        entity: "bookings",
        entityId: input.id,
        details: { orderId: booking.orderId },
      });

      return { success: true };
    }),

  // Validate promo code
  validatePromo: protectedProcedure
    .input(z.object({ code: z.string(), eventId: z.number().optional() }))
    .query(async ({ input }) => {
      const promo = await db.validatePromoCode(input.code, input.eventId);
      if (!promo) return { valid: false, message: "Invalid or expired promo code" };
      return {
        valid: true,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        code: promo.code,
      };
    }),
});
