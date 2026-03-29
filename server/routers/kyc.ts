import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { kycService } from "../services/kyc.service";

export const kycRouter = router({
  status: protectedProcedure.query(({ ctx }) =>
    kycService.getStatus(ctx.user.id, ctx.user.kycStatus)),

  submit: protectedProcedure
    .input(z.object({
      documentType: z.enum(["commercial_register", "national_id", "business_license", "tax_certificate", "bank_statement", "other"]),
      documentNumber: z.string().max(100).optional(),
      fileUrl: z.string().url().max(2000),
      fileName: z.string().max(255).optional(),
      expiryDate: z.string().max(20).optional(),
    }))
    .mutation(({ ctx, input }) =>
      kycService.submit(ctx.user.id, ctx.user.kycStatus, input)),

  documents: protectedProcedure.query(({ ctx }) =>
    kycService.listDocuments(ctx.user.id)),
});
