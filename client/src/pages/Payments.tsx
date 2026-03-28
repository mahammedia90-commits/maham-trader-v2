/*
 * Design: Fluid Obsidian Glass — Payments with invoices, payment gateway simulation, receipts
 * Data: tRPC hooks (real API)
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth, type Booking } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard, Download, CheckCircle, Clock, XCircle, Receipt,
  ChevronDown, ChevronUp, Building2, Wallet, X, Banknote,
  Landmark, Smartphone, type LucideIcon
} from 'lucide-react';
import { toast } from 'sonner';

type PaymentFilter = 'all' | 'pending' | 'paid' | 'refunded';

interface Invoice {
  id: string;
  bookingId: string | number;
  orderId: string;
  expoTitle: string;
  boothId: string;
  zone: string;
  subtotal: number;
  serviceFee: number;
  vat: number;
  total: number;
  status: 'paid' | 'pending' | 'refunded';
  dueDate: string;
  createdAt: string;
}

export default function Payments() {
  const { t, language } = useLanguage();
  const { bookings, updateBookingStatus, addNotification } = useAuth();
  const [filter, setFilter] = useState<PaymentFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'wallet'>('card');
  const [processing, setProcessing] = useState(false);

  const invoices = useMemo((): Invoice[] => {
    return bookings.map((b: Booking, i: number) => {
      const price = Number(b.price ?? 0);
      return {
        id: `INV-${2026}${String(i + 1).padStart(4, '0')}`,
        bookingId: b.id,
        orderId: b.orderId ?? `#${b.id}`,
        expoTitle: b.expoTitle ?? '',
        boothId: String(b.boothId ?? ''),
        zone: b.zone ?? '',
        subtotal: price,
        serviceFee: Math.round(price * 0.05),
        vat: Math.round(price * 0.15),
        total: Math.round(price * 1.20),
        status: b.status === 'paid' ? 'paid' as const : b.status === 'rejected' ? 'refunded' as const : 'pending' as const,
        dueDate: '2026-04-15',
        createdAt: typeof b.createdAt === 'string' ? b.createdAt : new Date(b.createdAt).toLocaleDateString(),
      };
    });
  }, [bookings]);

  const filtered = useMemo(() => {
    if (filter === 'all') return invoices;
    return invoices.filter(inv => inv.status === filter);
  }, [invoices, filter]);

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.total, 0);

  const statusConfig: Record<string, { icon: LucideIcon; color: string; bg: string; label: string }> = {
    paid: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: t('payment_status.paid') },
    pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: t('common.pending') },
    refunded: { icon: Banknote, color: 'text-blue-400', bg: 'bg-blue-500/10', label: t('payment_status.refunded') },
  };

  const handlePay = (inv: Invoice) => {
    setPayingInvoice(inv);
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!payingInvoice) return;
    setProcessing(true);
    setTimeout(() => {
      updateBookingStatus(String(payingInvoice.bookingId), 'paid');
      addNotification({
        titleAr: 'تم الدفع بنجاح',
        titleEn: 'Payment Successful',
        messageAr: `تم استلام الدفعة ${payingInvoice.total.toLocaleString()} ريال بنجاح`,
        messageEn: `Payment of ${payingInvoice.total.toLocaleString()} SAR received`,
        type: 'payment',
        actionUrl: '/payments',
      });
      toast.success(t('payments.payment_successful'));
      setShowPaymentModal(false);
      setPayingInvoice(null);
      setProcessing(false);
    }, 2000);
  };

  return (
    <div className="page-enter space-y-5 pb-20 lg:pb-6">
      <div>
        <h1 className="text-lg sm:text-2xl font-bold" >{t('payment.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('payments.subtitle')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Receipt, label: t('payments.total_invoices'), value: String(invoices.length), color: '#d4a843' },
          { icon: CheckCircle, label: t('payments.paid'), value: `${totalPaid.toLocaleString()} ${t('common.sar')}`, color: '#4ADE80' },
          { icon: Clock, label: t('common.pending'), value: `${totalPending.toLocaleString()} ${t('common.sar')}`, color: '#F59E0B' },
          { icon: Wallet, label: t('payments.balance_due'), value: `${totalPending.toLocaleString()} ${t('common.sar')}`, color: '#EF4444' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
            <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'paid', 'refunded'] as PaymentFilter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 ${filter === f ? 'bg-primary/10 text-primary border-primary/30 font-medium' : 'bg-accent/30 text-muted-foreground border-border/30'}`}>
            {f === 'all' ? (t('common.all')) : statusConfig[f]?.label || f}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl glass-card text-center transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
          <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">{t('payments.no_invoices')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv, i) => {
            const cfg = statusConfig[inv.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === inv.id;
            return (
              <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-xl glass-card overflow-hidden">
                <div className="p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : inv.id)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                        <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs text-muted-foreground">{inv.id}</span>
                          <Badge className={`${cfg.bg} ${cfg.color} text-[10px] border-0`}>{cfg.label}</Badge>
                        </div>
                        <h3 className="font-semibold text-sm">{inv.expoTitle}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[var(--gold-primary)]">{inv.total.toLocaleString()} {t('common.sar')}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{t('expos.booth')}: {inv.boothId}</span>
                    <span>{t('common.due')}: <span dir="ltr">{inv.dueDate}</span></span>
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                        <div className="p-4 rounded-lg bg-accent/30">
                          <h4 className="text-sm font-semibold mb-3">{t('payments.invoice_breakdown')}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">{t('expo.booth_price')}</span><span>{inv.subtotal.toLocaleString()} {t('common.sar')}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">{t('services.service_fee_5')}</span><span>{inv.serviceFee.toLocaleString()} {t('common.sar')}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">{t('common.vat_15')}</span><span>{inv.vat.toLocaleString()} {t('common.sar')}</span></div>
                            <div className="flex justify-between pt-2 border-t border-border/30 font-bold"><span>{t('common.total')}</span><span className="text-[var(--gold-primary)]">{inv.total.toLocaleString()} {t('common.sar')}</span></div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {inv.status === 'pending' && (
                            <Button onClick={() => handlePay(inv)} className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 font-semibold text-sm">
                              <CreditCard className="w-4 h-4 me-1" />{t('payments.pay_now')}
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => toast.info(t('common.loading'))}>
                            <Download className="w-4 h-4 me-1" />{t('payments.download_invoice')}
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

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && payingInvoice && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => !processing && setShowPaymentModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-md p-6 rounded-xl glass-card shadow-2xl transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><CreditCard className="w-5 h-5 text-[var(--gold-primary)]" />{t('payments.payment_gateway')}</h3>
                {!processing && <button onClick={() => setShowPaymentModal(false)}><X className="w-5 h-5 text-muted-foreground" /></button>}
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/30 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t('payments.amount_due')}</p>
                  <p className="text-xl sm:text-3xl font-bold text-[var(--gold-primary)]">{payingInvoice.total.toLocaleString()} <span className="text-sm">{t('common.sar')}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">{payingInvoice.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">{t('payments.payment_method')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'card' as const, icon: CreditCard, label: t('common.card') },
                      { key: 'bank' as const, icon: Landmark, label: t('common.bank') },
                      { key: 'wallet' as const, icon: Smartphone, label: 'Apple Pay' },
                    ].map(m => (
                      <button key={m.key} onClick={() => setPaymentMethod(m.key)}
                        className={`p-3 rounded-lg border text-center transition-all duration-300 ${paymentMethod === m.key ? 'border-[var(--gold-primary)]/30 bg-[var(--gold-primary)]/5' : 'border-border/30 bg-accent/20'}`}>
                        <m.icon className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === m.key ? 'text-[var(--gold-primary)]' : 'text-muted-foreground'}`} />
                        <span className="text-xs">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div><label className="text-xs text-muted-foreground block mb-1">{t('common.card_number')}</label><input type="text" placeholder="4242 4242 4242 4242" className="w-full h-9 px-3 rounded-lg border border-border/50 bg-accent/30 text-sm" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs text-muted-foreground block mb-1">{t('common.expiry')}</label><input type="text" placeholder="MM/YY" className="w-full h-9 px-3 rounded-lg border border-border/50 bg-accent/30 text-sm" /></div>
                      <div><label className="text-xs text-muted-foreground block mb-1">CVV</label><input type="text" placeholder="123" className="w-full h-9 px-3 rounded-lg border border-border/50 bg-accent/30 text-sm" /></div>
                    </div>
                  </div>
                )}
                {paymentMethod === 'bank' && (
                  <div className="p-4 rounded-lg bg-accent/30 space-y-2 text-sm">
                    <p className="font-medium">{t('misc.bank_transfer_details')}</p>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t('payments.bank')}</span><span>Al Rajhi Bank</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">IBAN</span><span dir="ltr">SA0380000000608010167519</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t('common.beneficiary')}</span><span>Maham Expo LLC</span></div>
                  </div>
                )}
                <Button onClick={confirmPayment} disabled={processing}
                  className="w-full bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 font-semibold disabled:opacity-50">
                  {processing ? <span className="animate-pulse">{t('common.processing')}</span> : (language === 'ar' ? `ادفع ${payingInvoice.total.toLocaleString()} ${t('common.sar')}` : `Pay ${payingInvoice.total.toLocaleString()} ${t('common.sar')}`)}
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">{t('misc.all_transactions_are_encrypted')}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
