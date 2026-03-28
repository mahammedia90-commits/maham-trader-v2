/*
 * Design: Fluid Obsidian Glass — KYC Verification with step-by-step document upload and status tracking
 * Data: tRPC hooks (real API)
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield, Upload, FileCheck, AlertCircle, CheckCircle, Clock, X,
  FileText, CreditCard, Building2, User, Camera, Eye, Info, type LucideIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { useSubmitKyc } from '@/hooks/useApi';

interface DocStatus { uploaded: boolean; fileName?: string; uploadedAt?: string; }

type KycStatusKey = 'pending' | 'submitted' | 'verified' | 'rejected';

const statusConfig: Record<KycStatusKey, { icon: LucideIcon; color: string; bg: string; border: string; labelKey: string; descKey: string }> = {
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', labelKey: 'kyc.status.pending', descKey: 'kyc.please_upload_required_documents' },
  submitted: { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', labelKey: 'kyc.status.submitted', descKey: 'kyc.your_documents_are_under' },
  verified: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', labelKey: 'kyc.status.verified', descKey: 'expo.your_identity_has_been' },
  rejected: { icon: X, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', labelKey: 'kyc.status.rejected', descKey: 'kyc.documents_rejected_please_reupload' },
};

export default function KYC() {
  const { t, language } = useLanguage();
  const { user, updateUser } = useAuth();
  const submitKyc = useSubmitKyc();
  const [uploading, setUploading] = useState<string | null>(null);
  const [docs, setDocs] = useState<Record<string, DocStatus>>({
    commercial_register: { uploaded: false },
    national_id: { uploaded: false },
    vat_certificate: { uploaded: false },
    bank_certificate: { uploaded: false },
  });

  const handleUpload = (docKey: string) => {
    setUploading(docKey);
    // Simulate upload then call KYC submit API
    setTimeout(() => {
      setDocs(prev => ({
        ...prev,
        [docKey]: { uploaded: true, fileName: `${docKey}_scan.pdf`, uploadedAt: new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') }
      }));
      toast.success(t('kyc.document_uploaded_successfully'));
      setUploading(null);

      // Submit KYC via API when required docs are uploaded
      const updatedDocs = { ...docs, [docKey]: { uploaded: true } };
      const allRequired = updatedDocs.commercial_register.uploaded && updatedDocs.national_id.uploaded;
      if (allRequired && (user?.kycStatus === 'pending' || user?.kycStatus === null)) {
        submitKyc.mutate(
          { documentType: docKey as "commercial_register" | "national_id" | "business_license" | "tax_certificate" | "bank_statement" | "other", fileUrl: `uploads/${docKey}_scan.pdf` },
          {
            onSuccess: () => {
              updateUser({ kycStatus: 'submitted' } as any);
              toast.info(t('kyc.documents_submitted_for_review'));
            },
          }
        );
      }
    }, 2000);
  };

  const kycStatusKey: KycStatusKey = (user?.kycStatus as KycStatusKey) || 'pending';
  const status = statusConfig[kycStatusKey];
  const StatusIcon = status.icon;

  const uploadedCount = Object.values(docs).filter(d => d.uploaded).length;
  const totalDocs = 4;
  const progress = Math.round((uploadedCount / totalDocs) * 100);

  const documents: Array<{ key: string; icon: LucideIcon; title: string; desc: string; required: boolean }> = [
    { key: 'commercial_register', icon: Building2, title: t('kyc.commercial_register'), desc: t('auth.valid_commercial_register_copy'), required: true },
    { key: 'national_id', icon: User, title: t('kyc.national_id'), desc: t('misc.national_id_or_iqama'), required: true },
    { key: 'vat_certificate', icon: FileText, title: t('common.vat_certificate'), desc: t('misc.vat_registration_certificate'), required: false },
    { key: 'bank_certificate', icon: CreditCard, title: t('common.bank_certificate'), desc: t('auth.bank_letter_confirming_account'), required: false },
  ];

  return (
    <div className="page-enter space-y-6 pb-20 lg:pb-6">
      <h1 className="text-lg sm:text-2xl font-bold">{t('kyc.title')}</h1>

      <div className="max-w-3xl">
        {/* Status Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-xl ${status.bg} border ${status.border} mb-6`}>
          <div className="flex items-start gap-3">
            <StatusIcon className={`w-6 h-6 ${status.color} shrink-0 mt-0.5`} />
            <div>
              <p className={`font-bold ${status.color}`}>{t(status.labelKey)}</p>
              <p className="text-sm text-muted-foreground mt-1">{t(status.descKey)}</p>
            </div>
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-4 rounded-xl glass-card mb-6 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t('kyc.verification_progress')}</span>
            <span className="text-sm font-bold text-[var(--gold-primary)]">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-accent/50 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }}
              className="h-full rounded-full bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914]" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {language === 'ar' ? `${uploadedCount} من ${totalDocs} مستندات تم رفعها` : `${uploadedCount} of ${totalDocs} documents uploaded`}
          </p>
        </motion.div>

        {/* Documents */}
        <div className="space-y-4">
          {documents.map((doc, i) => {
            const docStatus = docs[doc.key] ?? { uploaded: false };
            const isUploading = uploading === doc.key;
            return (
              <motion.div key={doc.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                className={`p-4 rounded-xl glass-card border transition-all duration-300 ${docStatus.uploaded ? 'border-green-500/30' : 'border-border/50'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${docStatus.uploaded ? 'bg-green-500/10' : 'bg-accent/50'}`}>
                      {docStatus.uploaded ? <CheckCircle className="w-5 h-5 text-green-400" /> : <doc.icon className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-sm">{doc.title}</p>
                        {doc.required && <Badge className="bg-red-500/10 text-red-400 text-[10px] border-0">{t('common.required')}</Badge>}
                        {!doc.required && <Badge className="bg-accent text-muted-foreground text-[10px] border-0">{t('common.optional')}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{doc.desc}</p>
                      {docStatus.uploaded && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-green-400">
                          <FileCheck className="w-3 h-3" />
                          <span>{docStatus.fileName}</span>
                          <span className="text-muted-foreground">— {docStatus.uploadedAt}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {docStatus.uploaded ? (
                      <>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.info(t('kyc.viewing_document'))}>
                          <Eye className="w-3 h-3 me-1" />{t('common.view')}
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                          setDocs(prev => ({ ...prev, [doc.key]: { uploaded: false } }));
                          toast.info(t('kyc.document_removed'));
                        }}>
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => handleUpload(doc.key)} disabled={isUploading || kycStatusKey === 'verified'}
                        className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 text-xs font-semibold">
                        {isUploading ? (
                          <span className="animate-pulse">{t('common.uploading')}</span>
                        ) : (
                          <><Upload className="w-3.5 h-3.5 me-1" />{t('kyc.upload')}</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-6 p-4 rounded-xl bg-accent/30 border border-border/30 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{t('common.important_notes')}</p>
              <p>{t('kyc.all_documents_must_be')}</p>
              <p>{t('misc.accepted_formats_pdf_jpg')}</p>
              <p>{t('kyc.documents_are_reviewed_within')}</p>
              <p>{t('expo.verification_is_required_for')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
