/*
 * Design: Fluid Obsidian Glass — My Bookings with status tracking, filters, timeline
 * Data: tRPC hooks (real API)
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth, type Booking } from '@/contexts/AuthContext';
import { useBookingGuard } from '@/hooks/useBookingGuard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar, CheckCircle, XCircle, Clock, AlertCircle, CreditCard,
  FileText, Search, Filter, Eye, MapPin, Building2, ArrowUpRight,
  ChevronDown, ChevronUp, MoreHorizontal, Download, type LucideIcon
} from 'lucide-react';

type StatusFilter = 'all' | 'pending_review' | 'approved' | 'paid' | 'rejected' | 'cancelled';

export default function Bookings() {
  const { t, language, isRTL } = useLanguage();
  const { bookings } = useAuth();
  const { checkAndProceed } = useBookingGuard();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return bookings.filter((b: Booking) => {
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const orderId = b.orderId ?? `#${b.id}`;
      const expoTitle = b.expoTitle ?? '';
      const boothId = String(b.boothId ?? '');
      const matchSearch = !search || orderId.includes(search) || expoTitle.includes(search) || boothId.includes(search);
      return matchStatus && matchSearch;
    });
  }, [bookings, statusFilter, search]);

  const statusConfig: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
    pending_review: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    approved: { icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    pending_payment: { icon: CreditCard, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    paid: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    cancelled: { icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-500/10' },
  };

  const statusCounts = useMemo(() => ({
    all: bookings.length,
    pending_review: bookings.filter((b: Booking) => b.status === 'pending_review').length,
    approved: bookings.filter((b: Booking) => b.status === 'approved').length,
    paid: bookings.filter((b: Booking) => b.status === 'paid').length,
    rejected: bookings.filter((b: Booking) => b.status === 'rejected').length,
    cancelled: bookings.filter((b: Booking) => b.status === 'cancelled').length,
  }), [bookings]);

  const getProgressSteps = (status: string) => {
    const steps = [
      { key: 'submitted', label: t('common.submitted'), labelEn: 'Submitted' },
      { key: 'review', label: t('status.pending'), labelEn: 'Under Review' },
      { key: 'approved', label: t('common.approved'), labelEn: 'Approved' },
      { key: 'payment', label: t('payments.payment'), labelEn: 'Payment' },
      { key: 'confirmed', label: t('status.confirmed'), labelEn: 'Confirmed' },
    ];

    const statusMap: Record<string, number> = {
      pending_review: 1,
      approved: 2,
      pending_payment: 3,
      paid: 4,
      rejected: -1,
      cancelled: -1,
    };

    const currentStep = statusMap[status] ?? 0;
    return { steps, currentStep };
  };

  return (
    <div className="page-enter space-y-5 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">
            {t('booking.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' ? `${bookings.length} حجز` : `${bookings.length} bookings`}
          </p>
        </div>
        <Button 
          style={{ background: 'linear-gradient(135deg, #8B6914 0%, #d4a843 50%, #8B6914 100%)', color: 'var(--foreground)' }} 
          className="font-semibold text-sm"
          onClick={() => checkAndProceed({ redirectTo: '/booking-flow' })}
        >
          <Building2 className="w-4 h-4 me-1" />{t('expos.book_now')}
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('bookings.search_placeholder')}
            value={search} onChange={e => setSearch(e.target.value)} className="ps-10 bg-card border-border/50" />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending_review', 'approved', 'paid', 'rejected', 'cancelled'] as StatusFilter[]).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 flex items-center gap-1.5 ${
              statusFilter === s ? 'bg-primary/10 text-primary border-primary/30 font-medium' : 'bg-accent/30 text-muted-foreground border-border/30 hover:text-foreground'
            }`}>
            {s !== 'all' && (() => {
              const cfg = statusConfig[s];
              const Icon = cfg.icon;
              return <Icon className={`w-3 h-3 ${cfg.color}`} />;
            })()}
            {s === 'all' ? (t('common.all')) : t(`booking.status.${s}`)}
            {statusCounts[s] > 0 && <Badge variant="secondary" className="text-[10px] h-4 min-w-4 px-1">{statusCounts[s]}</Badge>}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl glass-card text-center transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">{t('bookings.no_bookings_found')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('expo.start_browsing_expos_and')}</p>
          <Button className="mt-4" variant="outline" onClick={() => checkAndProceed({ redirectTo: '/booking-flow' })}>{t('expos.book_now')}</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking: Booking, i: number) => {
            const cfg = statusConfig[booking.status] || statusConfig.pending_review;
            const StatusIcon = cfg.icon;
            const bookingId = String(booking.id);
            const isExpanded = expandedId === bookingId;
            const { steps, currentStep } = getProgressSteps(booking.status);
            const orderId = booking.orderId ?? `#${booking.id}`;
            const expoTitle = booking.expoTitle ?? '';
            const boothId = booking.boothId ?? '';
            const zone = booking.zone ?? '';
            const area = booking.area ?? 0;
            const price = booking.price ?? 0;
            const createdAt = booking.createdAt ?? '';

            return (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl glass-card hover:gold-border-glow transition-all duration-300 overflow-hidden">
                {/* Main Row */}
                <div className="p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : bookingId)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                        <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs text-muted-foreground">{orderId}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>
                            {t(`booking.status.${booking.status}`)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm">{expoTitle}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: '#d4a843' }}>{price.toLocaleString()} {t('common.sar')}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div><span className="text-muted-foreground block">{t('booking.booth')}</span><span className="font-medium">{boothId}</span></div>
                    <div><span className="text-muted-foreground block">{t('booking.zone')}</span><span className="font-medium">{zone}</span></div>
                    <div><span className="text-muted-foreground block">{t('booking.area')}</span><span className="font-medium">{area} m²</span></div>
                    <div><span className="text-muted-foreground block">{t('common.date')}</span><span className="font-medium" dir="ltr">{typeof createdAt === 'string' ? createdAt : new Date(createdAt).toLocaleDateString()}</span></div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                        {/* Progress Tracker */}
                        {currentStep >= 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground mb-3">{t('common.status_tracking')}</h4>
                            <div className="flex items-center justify-between relative">
                              <div className="absolute top-3 start-0 end-0 h-0.5 bg-border/50" />
                              {steps.map((step, si) => (
                                <div key={step.key} className="relative flex flex-col items-center z-10">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    si < currentStep ? 'bg-green-500 text-foreground' :
                                    si === currentStep ? 'bg-[var(--gold-primary)] text-foreground' :
                                    'bg-accent text-muted-foreground'
                                  }`}>
                                    {si < currentStep ? <CheckCircle className="w-3.5 h-3.5" /> : si + 1}
                                  </div>
                                  <span className={`text-[9px] mt-1 whitespace-nowrap ${si <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                    {step.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reviewer Note */}
                        {booking.reviewerNote && (
                          <div className="p-3 rounded-lg bg-accent/30">
                            <span className="text-xs text-muted-foreground block mb-1">{t('contracts.supervisor_note')}</span>
                            <p className="text-sm">{booking.reviewerNote}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {booking.status === 'approved' && booking.contractId && (
                            <>
                              <Link href="/contracts">
                                <Button size="sm" variant="outline" className="text-xs">
                                  <FileText className="w-3 h-3 me-1" />{t('contract.view')}
                                </Button>
                              </Link>
                              <Link href="/payments">
                                <Button size="sm" className="text-xs bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground">
                                  <CreditCard className="w-3 h-3 me-1" />{t('payments.pay_now')}
                                </Button>
                              </Link>
                            </>
                          )}
                          {booking.status === 'paid' && (
                            <Button size="sm" variant="outline" className="text-xs">
                              <Download className="w-3 h-3 me-1" />{t('common.download_receipt')}
                            </Button>
                          )}
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
    </div>
  );
}
