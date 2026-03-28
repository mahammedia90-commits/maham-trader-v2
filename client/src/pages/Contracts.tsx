/*
 * Design: Fluid Obsidian Glass — Contracts with digital signing, PDF preview, status tracking
 * Data: tRPC hooks (real API)
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth, type Contract } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText, Download, Pen, CheckCircle, Clock, AlertCircle,
  Eye, ChevronDown, ChevronUp, Shield, Calendar, X, Stamp,
  FileCheck, Printer, type LucideIcon
} from 'lucide-react';
import { toast } from 'sonner';

export default function Contracts() {
  const { t, language } = useLanguage();
  const { contracts, updateContractStatus, user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [signatureConfirmed, setSignatureConfirmed] = useState(false);

  const handleSign = (id: string) => {
    setSigningId(id);
    setSignatureConfirmed(false);
  };

  const confirmSign = (id: string) => {
    updateContractStatus(id, 'signed');
    toast.success(t('payments.contract_signed_successfully_you'));
    setSigningId(null);
    setSignatureConfirmed(false);
  };

  const statusConfig: Record<string, { icon: LucideIcon; color: string; bg: string; label: string }> = {
    draft: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: t('contracts.draft_awaiting_signature') },
    signed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: t('contracts.signed') },
    active: { icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', label: t('status.active') },
    expired: { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-500/10', label: t('status.ended') },
  };

  return (
    <div className="page-enter space-y-5 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-2xl font-bold" >
          {t('contract.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {language === 'ar' ? `${contracts.length} عقد` : `${contracts.length} contracts`}
        </p>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <div className="p-12 rounded-xl glass-card text-center transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">{t('contracts.no_contracts_yet')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('contracts.contracts_will_appear_here')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((c: Contract, i: number) => {
            const cfg = statusConfig[c.status] || statusConfig.draft;
            const StatusIcon = cfg.icon;
            const contractId = String(c.id);
            const isExpanded = expandedId === contractId;
            const expoName = language === 'ar' ? (c.expoNameAr ?? c.expoNameEn ?? '') : (c.expoNameEn ?? c.expoNameAr ?? '');
            const unitDetails = c.unitDetails ?? '';
            const totalAmount = Number(c.totalAmount ?? 0);
            const terms = c.terms ?? [];
            const createdAt = c.createdAt ?? '2026-03-15';

            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl glass-card overflow-hidden">
                {/* Header */}
                <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : contractId)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                        <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div>
                        <span className="font-mono text-xs text-muted-foreground block">{contractId}</span>
                        <h3 className="font-semibold">{expoName}</h3>
                        <p className="text-xs text-muted-foreground">{unitDetails}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${cfg.bg} ${cfg.color} text-[10px] border-0`}>{cfg.label}</Badge>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{typeof createdAt === 'string' ? createdAt : new Date(createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-lg font-bold text-[var(--gold-primary)]">{totalAmount.toLocaleString()} {t('common.sar')}</p>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="px-5 pb-5 space-y-4 border-t border-border/30 pt-4">
                        {/* Contract Terms */}
                        {terms.length > 0 && (
                          <div className="p-4 rounded-lg bg-accent/30">
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <FileCheck className="w-4 h-4 text-[var(--gold-primary)]" />
                              {t('contracts.contract_terms')}
                            </h4>
                            <ul className="space-y-2">
                              {terms.map((term: string, ti: number) => (
                                <li key={ti} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-[var(--gold-primary)] mt-0.5 shrink-0">•</span>
                                  <span>{term}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Payment Breakdown */}
                        <div className="p-4 rounded-lg bg-accent/30">
                          <h4 className="text-sm font-semibold mb-3">{t('payments.amount_breakdown')}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">{t('expo.booth_price')}</span><span>{(totalAmount * 0.87).toLocaleString()} {t('common.sar')}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">{t('services.service_fee')}</span><span>{(totalAmount * 0.05).toLocaleString()} {t('common.sar')}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">{t('contracts.vat_15')}</span><span>{(totalAmount * 0.08).toLocaleString()} {t('common.sar')}</span></div>
                            <div className="flex justify-between pt-2 border-t border-border/30 font-bold">
                              <span>{t('common.total')}</span>
                              <span className="text-[var(--gold-primary)]">{totalAmount.toLocaleString()} {t('common.sar')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {c.status === 'draft' && (
                            <Button onClick={() => handleSign(contractId)}
                              className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 font-semibold">
                              <Pen className="w-4 h-4 me-1" />{t('contract.sign')}
                            </Button>
                          )}
                          <Button variant="outline" onClick={() => toast.info(t('common.loading'))}>
                            <Download className="w-4 h-4 me-1" />{t('contract.download')}
                          </Button>
                          <Button variant="outline" onClick={() => toast.info(t('common.printing'))}>
                            <Printer className="w-4 h-4 me-1" />{t('common.print')}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Signing Modal */}
      <AnimatePresence>
        {signingId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50" onClick={() => setSigningId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-md p-6 rounded-xl glass-card shadow-2xl transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Stamp className="w-5 h-5 text-[var(--gold-primary)]" />
                  {t('contracts.sign')}
                </h3>
                <button onClick={() => setSigningId(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/30 text-center">
                  <Stamp className="w-12 h-12 text-[var(--gold-primary)] mx-auto mb-2" />
                  <p className="text-sm font-medium">{t('contracts.digital_signature')}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('contracts.by_clicking_confirm_signature')}
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-dashed border-[#d4a843]/30 text-center">
                  <p className="text-lg font-bold text-[var(--gold-primary)]" >
                    {user?.name || 'Trader'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{user?.company ?? ''}</p>
                </div>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={signatureConfirmed} onChange={(e) => setSignatureConfirmed(e.target.checked)}
                    className="mt-1 rounded border-border" />
                  <span className="text-xs text-muted-foreground">
                    {t('contracts.i_confirm_that_i')}
                  </span>
                </label>

                <Button onClick={() => confirmSign(signingId)} disabled={!signatureConfirmed}
                  className="w-full bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 font-semibold disabled:opacity-50">
                  <Pen className="w-4 h-4 me-1" />
                  {t('contracts.confirm_signature')}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
