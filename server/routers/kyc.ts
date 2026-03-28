import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const kycRouter = router({
  // Get KYC status
  status: protectedProcedure.query(async ({ ctx }) => {
    const documents = await db.listKycDocumentsByUser(ctx.user.id);
    return {
      kycStatus: ctx.user.kycStatus,
      documents,
    };
  }),

  // Submit KYC document
  submit: protectedProcedure
    .input(z.object({
      documentType: z.enum(["commercial_register", "national_id", "business_license", "tax_certificate", "bank_statement", "other"]),
      documentNumber: z.string().optional(),
      fileUrl: z.string(),
      fileName: z.string().optional(),
      expiryDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const docId = await db.createKycDocument({
        userId: ctx.user.id,
        documentType: input.documentType,
        documentNumber: input.documentNumber ?? null,
        fileUrl: input.fileUrl,
        fileName: input.fileName ?? null,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
        status: "pending",
      });

      // Update user KYC status to submitted if it was pending
      if (ctx.user.kycStatus === "pending") {
        await db.updateUserProfile(ctx.user.id, { kycStatus: "submitted" });
      }

      // Notification
      await db.createNotification({
        userId: ctx.user.id,
        titleAr: "تم تقديم وثيقة KYC",
        titleEn: "KYC Document Submitted",
        messageAr: "تم تقديم وثيقتك بنجاح وستتم مراجعتها قريباً.",
        messageEn: "Your document has been submitted and will be reviewed shortly.",
        type: "kyc",
        channel: "in_app",
      });

      await db.createAuditLog({
        userId: ctx.user.id,
        action: "kyc.submit",
        entity: "kyc_documents",
        entityId: docId,
        details: { documentType: input.documentType },
      });

      return { documentId: docId };
    }),

  // List KYC documents
  documents: protectedProcedure.query(async ({ ctx }) => {
    return db.listKycDocumentsByUser(ctx.user.id);
  }),
});
