import * as db from "../db";
import { logger } from "../lib/logger";

export const kycService = {
  async getStatus(userId: number, kycStatus: string) {
    const documents = await db.listKycDocumentsByUser(userId);
    return { kycStatus, documents };
  },

  async submit(userId: number, currentKycStatus: string, input: {
    documentType: string; documentNumber?: string;
    fileUrl: string; fileName?: string; expiryDate?: string;
  }) {
    const docId = await db.createKycDocument({
      userId,
      documentType: input.documentType,
      documentNumber: input.documentNumber ?? null,
      fileUrl: input.fileUrl,
      fileName: input.fileName ?? null,
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
      status: "pending",
    });

    if (currentKycStatus === "pending") {
      await db.updateUserProfile(userId, { kycStatus: "submitted" });
    }

    await db.createNotification({
      userId,
      titleAr: "تم تقديم وثيقة KYC",
      titleEn: "KYC Document Submitted",
      messageAr: "تم تقديم وثيقتك بنجاح وستتم مراجعتها قريباً.",
      messageEn: "Your document has been submitted and will be reviewed shortly.",
      type: "kyc",
      channel: "in_app",
    });

    await db.createAuditLog({
      userId,
      action: "kyc.submit",
      entity: "kyc_documents",
      entityId: docId,
      details: { documentType: input.documentType },
    });

    logger.info("KYC document submitted", "KycService", { docId, userId });
    return { documentId: docId };
  },

  async listDocuments(userId: number) {
    return db.listKycDocumentsByUser(userId);
  },
};
