import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const contractsRouter = router({
  // List trader's contracts
  list: protectedProcedure.query(async ({ ctx }) => {
    const userContracts = await db.listContractsByUser(ctx.user.id);
    // Enrich with event info
    const enriched = await Promise.all(
      userContracts.map(async (contract) => {
        const event = contract.eventId ? await db.getEventById(contract.eventId) : null;
        return { ...contract, event };
      })
    );
    return enriched;
  }),

  // Get single contract detail
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const contract = await db.getContractById(input.id);
      if (!contract || contract.userId !== ctx.user.id) throw new Error("Contract not found");
      const booking = await db.getBookingById(contract.bookingId);
      const event = contract.eventId ? await db.getEventById(contract.eventId) : null;
      const unit = booking ? await db.getUnitById(booking.unitId) : null;
      return { ...contract, booking, event, unit };
    }),

  // Sign contract (trader signs their part)
  sign: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const contract = await db.getContractById(input.id);
      if (!contract || contract.userId !== ctx.user.id) throw new Error("Contract not found");
      if (contract.status !== "pending_signature") {
        throw new Error("Contract is not pending signature");
      }

      await db.updateContract(input.id, {
        signedByUser: true,
        signedAt: new Date(),
        status: contract.signedByAdmin ? "signed" : "pending_signature",
      });

      // If both parties signed, activate the contract
      if (contract.signedByAdmin) {
        await db.updateContract(input.id, { status: "active" });
      }

      // Notification
      await db.createNotification({
        userId: ctx.user.id,
        titleAr: "تم توقيع العقد",
        titleEn: "Contract Signed",
        messageAr: `تم توقيع العقد رقم ${contract.contractNumber} بنجاح.`,
        messageEn: `Contract ${contract.contractNumber} has been signed successfully.`,
        type: "contract",
        channel: "in_app",
      });

      await db.createAuditLog({
        userId: ctx.user.id,
        action: "contract.sign",
        entity: "contracts",
        entityId: input.id,
        details: { contractNumber: contract.contractNumber },
      });

      return { success: true };
    }),
});
