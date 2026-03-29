import * as db from "../db";
import { NotFoundError, AuthorizationError, ValidationError } from "../lib/errors";
import { logger } from "../lib/logger";

export const contractService = {
  async listByUser(userId: number) {
    const contracts = await db.listContractsByUser(userId);
    return Promise.all(
      contracts.map(async (contract) => {
        const event = contract.eventId ? await db.getEventById(contract.eventId) : null;
        return { ...contract, event };
      }),
    );
  },

  async getByIdForUser(contractId: number, userId: number) {
    const contract = await db.getContractById(contractId);
    if (!contract) throw new NotFoundError("Contract", contractId);
    if (contract.userId !== userId) throw new AuthorizationError("Access denied to this contract");
    const booking = await db.getBookingById(contract.bookingId);
    const event = contract.eventId ? await db.getEventById(contract.eventId) : null;
    const unit = booking ? await db.getUnitById(booking.unitId) : null;
    return { ...contract, booking, event, unit };
  },

  async sign(contractId: number, userId: number) {
    const contract = await db.getContractById(contractId);
    if (!contract) throw new NotFoundError("Contract", contractId);
    if (contract.userId !== userId) throw new AuthorizationError("Access denied to this contract");
    if (contract.status !== "pending_signature") {
      throw new ValidationError("Contract is not pending signature");
    }

    const newStatus = contract.signedByAdmin ? "active" : "pending_signature";
    await db.updateContract(contractId, {
      signedByUser: true,
      signedAt: new Date(),
      status: newStatus,
    });

    await db.createNotification({
      userId,
      titleAr: "تم توقيع العقد",
      titleEn: "Contract Signed",
      messageAr: `تم توقيع العقد رقم ${contract.contractNumber} بنجاح.`,
      messageEn: `Contract ${contract.contractNumber} has been signed successfully.`,
      type: "contract",
      channel: "in_app",
    });

    await db.createAuditLog({
      userId,
      action: "contract.sign",
      entity: "contracts",
      entityId: contractId,
      details: { contractNumber: contract.contractNumber },
    });

    logger.info("Contract signed", "ContractService", { contractId, userId });
    return { success: true };
  },
};
