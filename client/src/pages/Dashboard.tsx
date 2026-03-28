/*
 * Maham Expo — Premium Trader Dashboard
 * Design: Deep Obsidian (#FFFFFF) + Real Gold (#d4a843) + Clean White
 * Level: Apple + Bloomberg Terminal 2027
 * Glass Morphism with depth, shadows, and premium animations
 * Data: tRPC hooks (real API)
 */
import { useMemo, type ReactNode } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth, type Booking, type Contract, type Notification } from '@/contexts/AuthContext';
import { useBookingGuard } from '@/hooks/useBookingGuard';
import { useEvents } from '@/hooks/useApi';
import {
  Building2, Calendar, FileText, CreditCard, TrendingUp, Star,
  MapPin, ArrowUpRight, Bell, Clock, Sparkles, CheckCircle,
  AlertTriangle, Users, Eye, BarChart3, Zap, Bot, Briefcase,
  XCircle, AlertCircle, Package, ChevronRight, ArrowRight,
  Loader2, type LucideIcon
} from 'lucide-react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gold?: boolean;
  luxury?: boolean;
  style?: React.CSSProperties;
  [key: string]: any;
}

function GlassCard({ children, className = '', hover = true, gold = false, luxury = false, style, ...props }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? {
        y: -4,
        scale: 1.008,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
      } : undefined}
      className={`rounded-2xl transition-all duration-500 will-change-transform ${
        gold ? 'glass-card-gold' : luxury ? 'glass-luxury' : 'glass-card'
      } ${className}`}
      style={{
        contain: 'layout',
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default function Dashboard() {
  const { t, language, isRTL } = useLanguage();
  const { user, bookings, contracts, notifications } = useAuth();
  const { checkAndProceed } = useBookingGuard();
  const { data: eventsData } = useEvents();

  const stats = useMemo(() => ({
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b: Booking) => b.status === 'pending_review').length,
    approvedBookings: bookings.filter((b: Booking) => b.status === 'approved' || b.status === 'paid').length,
    totalContracts: contracts.length,
    unsignedContracts: contracts.filter((c: Contract) => c.status === 'draft').length,
    totalSpent: bookings.filter((b: Booking) => b.status === 'paid').reduce((sum: number, b: Booking) => sum + (b.price ?? 0), 0),
    unreadNotifications: notifications.filter((n: Notification) => !(n.read ?? n.isRead)).length,
  }), [bookings, contracts, notifications]);

  const recentBookings = bookings.slice(0, 5);
  const upcomingExpos = (eventsData ?? []).filter((e: any) => e.status !== 'completed').slice(0, 3);
  const recentNotifications = notifications.slice(0, 5);

  const statusConfig: Record<string, { color: string; bg: string; label: string; icon: LucideIcon }> = {
    pending_review: { color: '#d4a843', bg: 'rgba(212, 168, 67, 0.08)', label: t('status.pending'), icon: Clock },
    approved: { color: '#38BDF8', bg: 'rgba(56,189,248,0.08)', label: t('status.approved'), icon: CheckCircle },
    paid: { color: '#4ADE80', bg: 'rgba(74,222,128,0.08)', label: t('payment_status.paid'), icon: CheckCircle },
    rejected: { color: '#F87171', bg: 'rgba(248,113,113,0.08)', label: t('status.rejected'), icon: XCircle },
    draft: { color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', label: t('contract_status.draft'), icon: AlertCircle },
    signed: { color: '#4ADE80', bg: 'rgba(74,222,128,0.08)', label: t('contract_status.signed'), icon: CheckCircle },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6">
      {/* Welcome Header */}
      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground">
            {t('welcomeTrader')}، <span style={{
              background: 'linear-gradient(135deg, #8B6914 0%, #d4a843 30%, #D4B048 50%, #d4a843 70%, #8B6914 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>{user?.name ?? ''}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground/60 mt-1">{t('dashboardSubtitle')}</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {([
          {
            icon: Building2,
            label: t('bookings.my_bookings'),
            value: stats.totalBookings,
            sub: `${stats.pendingBookings} ${t('status.pending')}`,
            accent: '#d4a843',
            href: '/bookings',
          },
          {
            icon: FileText,
            label: t('contracts.my_contracts'),
            value: stats.totalContracts,
            sub: `${stats.unsignedContracts} ${t('contracts.unsigned')}`,
            accent: '#38BDF8',
            href: '/contracts',
          },
          {
            icon: CreditCard,
            label: t('dashboard.total_payments'),
            value: stats.totalSpent > 0 ? `${(stats.totalSpent / 1000).toFixed(0)}K` : '0',
            sub: t('common.sar'),
            accent: '#4ADE80',
            href: '/payments',
          },
          {
            icon: Star,
            label: t('dashboard.active_events'),
            value: upcomingExpos.length,
            sub: t('common.active_events'),
            accent: '#A78BFA',
            href: '/expos',
          },
        ] as Array<{ icon: LucideIcon; label: string; value: string | number; sub: string; accent: string; href: string }>).map((stat, i) => (
          <Link key={i} href={stat.href}>
            <GlassCard className="p-3 sm:p-4 lg:p-5 cursor-pointer group relative overflow-hidden">
              {/* Accent glow */}
              <div className="absolute -top-6 -end-6 w-20 h-20 rounded-full opacity-[0.06]"
                style={{ background: `radial-gradient(circle, ${stat.accent} 0%, transparent 70%)` }}
              />

              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.accent}10`, border: `1px solid ${stat.accent}15` }}
                >
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: stat.accent }} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/20 group-hover:text-muted-foreground/60 transition-colors" />
              </div>

              <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground/80 mt-0.5 font-medium leading-tight">{stat.label}</p>
              {stat.sub && (
                <p className="text-[10px] mt-1.5 font-medium" style={{ color: `${stat.accent}80` }}>{stat.sub}</p>
              )}
            </GlassCard>
          </Link>
        ))}
      </motion.div>

      {/* Action Required Banner */}
      {(stats.unsignedContracts > 0 || stats.pendingBookings > 0) && (
        <motion.div variants={item}>
          <GlassCard gold className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--maham-gold-bg)' }}
              >
                <AlertTriangle className="w-4 h-4" style={{ color: '#d4a843' }} />
              </div>
              <h3 className="font-semibold text-sm text-foreground/90">
                {t('dashboard.required_actions')}
              </h3>
            </div>
            <div className="space-y-2">
              {stats.unsignedContracts > 0 && (
                <Link href="/contracts">
                  <div className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 will-change-transform"
                    style={{ background: 'var(--maham-nav-hover-bg)', border: '1px solid var(--glass-border-subtle)' }}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4" style={{ color: '#d4a843' }} />
                      <span className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors">
                        {language === 'ar' ? `${stats.unsignedContracts} عقد بانتظار التوقيع` : `${stats.unsignedContracts} contract(s) awaiting signature`}
                      </span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground/40 group-hover:text-[var(--gold-primary)]/60 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                  </div>
                </Link>
              )}
              {stats.pendingBookings > 0 && (
                <Link href="/bookings">
                  <div className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 will-change-transform"
                    style={{ background: 'var(--maham-nav-hover-bg)', border: '1px solid var(--glass-border-subtle)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4" style={{ color: '#38BDF8' }} />
                      <span className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors">
                        {language === 'ar' ? `${stats.pendingBookings} حجز قيد المراجعة` : `${stats.pendingBookings} booking(s) under review`}
                      </span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground/40 group-hover:text-[#38BDF8]/60 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                  </div>
                </Link>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-5">

          {/* Recent Activity */}
          <motion.div variants={item}>
            <GlassCard hover={false} className="p-3 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--maham-gold-bg)' }}
                  >
                    <Bell className="w-4 h-4" style={{ color: '#d4a843' }} />
                  </div>
                  <h3 className="font-semibold text-foreground/90">
                    {t('common.recent_activity')}
                  </h3>
                </div>
                <Link href="/notifications">
                  <span className="text-xs text-muted-foreground/50 hover:text-[var(--gold-primary)]/60 transition-colors cursor-pointer">
                    {t('common.view_all')}
                  </span>
                </Link>
              </div>

              {recentNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground/50">{t('noData')}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentNotifications.map((notif: Notification) => {
                    const typeConfig: Record<string, { color: string; icon: LucideIcon }> = {
                      booking: { color: '#d4a843', icon: Calendar },
                      payment: { color: '#4ADE80', icon: CreditCard },
                      contract: { color: '#A78BFA', icon: FileText },
                      system: { color: '#38BDF8', icon: Bell },
                    };
                    const cfg = typeConfig[notif.type ?? 'system'] || typeConfig.system;
                    const isRead = notif.read ?? notif.isRead;
                    return (
                      <Link key={notif.id} href={notif.actionUrl || '#'}>
                        <motion.div
                          whileHover={{ x: isRTL ? -3 : 3 }}
                          className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 will-change-transform"
                          style={{
                            background: !isRead ? 'rgba(212, 168, 67, 0.03)' : 'transparent',
                          }}
                        >
                          <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center mt-0.5"
                            style={{ background: `${cfg.color}08`, border: `1px solid ${cfg.color}10` }}
                          >
                            <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground/80 truncate">
                              {language === 'ar' ? notif.titleAr : notif.titleEn}
                            </p>
                            <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
                              {language === 'ar' ? notif.messageAr : notif.messageEn}
                            </p>
                          </div>
                          {!isRead && (
                            <div className="w-2 h-2 rounded-full shrink-0 mt-2"
                              style={{ background: 'var(--maham-gold)', boxShadow: 'var(--maham-gold-glow)' }}
                            />
                          )}
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Smart Recommendations */}
          <motion.div variants={item}>
            <GlassCard hover={false} className="p-3 sm:p-5 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--maham-gold-bg)' }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: '#d4a843' }} />
                </div>
                <h3 className="font-semibold text-foreground/90">
                  {t('common.smart_recommendations')}
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {([
                  { icon: TrendingUp, title: t('expo.high_traffic_units'), desc: t('expo.units_near_entrance_get'), color: '#4ADE80' },
                  { icon: Zap, title: t('misc.early_bird_offer'), desc: t('bookings.book_30_days_early'), color: '#d4a843' },
                  { icon: BarChart3, title: t('common.competitor_analysis'), desc: t('bookings.3_competitors_booked_in'), color: '#38BDF8' },
                  { icon: Users, title: t('common.suggested_expos'), desc: t('dashboard.matching_expos'), color: '#A78BFA' },
                ] as Array<{ icon: LucideIcon; title: string; desc: string; color: string }>).map((rec, i) => (
                  <div key={i} className="p-4 rounded-xl cursor-pointer transition-all duration-300 group hover:-translate-y-0.5 will-change-transform"
                    style={{
                      background: 'var(--gold-bg)',
                      border: '1px solid var(--glass-border-subtle)',
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${rec.color}08`, border: `1px solid ${rec.color}10` }}
                    >
                      <rec.icon className="w-4 h-4" style={{ color: rec.color }} />
                    </div>
                    <p className="text-sm font-medium text-foreground/80 mb-1">{rec.title}</p>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed">{rec.desc}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Recent Bookings Table */}
          {bookings.length > 0 && (
            <motion.div variants={item}>
              <GlassCard hover={false} className="overflow-hidden">
                <div className="flex items-center justify-between p-5 pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--maham-gold-bg)' }}
                    >
                      <Calendar className="w-4 h-4" style={{ color: '#d4a843' }} />
                    </div>
                    <h3 className="font-semibold text-foreground/90">
                      {t('dashboard.recent_bookings')}
                    </h3>
                  </div>
                  <Link href="/bookings">
                    <span className="text-xs text-muted-foreground/50 hover:text-[var(--gold-primary)]/60 transition-colors cursor-pointer">
                      {t('common.view_all')}
                    </span>
                  </Link>
                </div>
                <div className="overflow-x-auto mt-4 -mx-1">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border-subtle)' }}>
                        <th className="text-start p-3 px-5 font-medium text-muted-foreground/50 text-xs">{t('common.order')}</th>
                        <th className="text-start p-3 font-medium text-muted-foreground/50 text-xs">{t('bookings.expo')}</th>
                        <th className="text-start p-3 font-medium text-muted-foreground/50 text-xs">{t('map.booth')}</th>
                        <th className="text-start p-3 font-medium text-muted-foreground/50 text-xs">{t('map.price')}</th>
                        <th className="text-start p-3 font-medium text-muted-foreground/50 text-xs">{t('status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((booking: Booking) => {
                        const sc = statusConfig[booking.status] || statusConfig.draft;
                        return (
                          <tr key={booking.id} style={{ borderBottom: '1px solid var(--glass-border-subtle)' }}
                            className="hover:bg-foreground/[0.01] transition-colors"
                          >
                            <td className="p-3 px-5 font-mono text-xs text-muted-foreground/80">{booking.orderId ?? `#${booking.id}`}</td>
                            <td className="p-3 text-foreground/70 truncate max-w-[200px]">{booking.expoTitle ?? ''}</td>
                            <td className="p-3 text-muted-foreground">{booking.boothId ?? ''}</td>
                            <td className="p-3 text-foreground/70 font-medium">{(booking.price ?? 0).toLocaleString()} {t('sar')}</td>
                            <td className="p-3">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                                style={{ background: sc.bg, color: sc.color }}
                              >
                                <sc.icon className="w-3 h-3" />
                                {sc.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-3 sm:space-y-4 lg:space-y-5">

          {/* Upcoming Expos */}
          <motion.div variants={item}>
            <GlassCard hover={false} className="p-3 sm:p-5">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--maham-gold-bg)' }}
                  >
                    <Building2 className="w-4 h-4" style={{ color: '#d4a843' }} />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground/90">
                    {t('dashboard.upcoming_expos')}
                  </h3>
                </div>
                <Link href="/expos">
                  <span className="text-xs text-muted-foreground/50 hover:text-[var(--gold-primary)]/60 transition-colors cursor-pointer">
                    {t('common.all')}
                  </span>
                </Link>
              </div>
              <div className="space-y-2">
                {upcomingExpos.length === 0 ? (
                  <div className="py-6 text-center">
                    <Building2 className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground/50">{t('noData')}</p>
                  </div>
                ) : upcomingExpos.map((e: any) => (
                  <Link key={e.id} href={`/expos/${e.id}`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-300 group hover:-translate-y-0.5 will-change-transform"
                      style={{ background: 'transparent' }}
                      onMouseEnter={(ev) => (ev.currentTarget.style.background = 'var(--maham-nav-hover-bg)')}
                      onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                    >
                      <div className="w-14 h-11 rounded-lg bg-accent/30 shrink-0 flex items-center justify-center ring-1 ring-white/[0.04]">
                        <Building2 className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground/70 truncate group-hover:text-foreground/90 transition-colors">
                          {language === 'ar' ? (e.titleAr ?? e.titleEn) : (e.titleEn ?? e.titleAr)}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50 mt-1">
                          <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{e.city ?? ''}</span>
                          <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" /><span dir="ltr">{e.startDate ? new Date(e.startDate).toLocaleDateString() : ''}</span></span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item}>
            <GlassCard hover={false} className="p-3 sm:p-5">
              <h3 className="font-semibold text-sm text-foreground/90 mb-3">{t('common.quick_actions')}</h3>
              <div className="space-y-1.5">
                {([
                  { icon: CreditCard, label: t('bookings.new_booking'), href: '/booking-flow', color: '#10B981', requiresKyc: true },
                  { icon: Building2, label: t('expos.browse'), href: '/expos', color: '#d4a843', requiresKyc: false },
                  { icon: MapPin, label: t('map.title'), href: '/map', color: '#38BDF8', requiresKyc: false },
                  { icon: Package, label: t('operations.title'), href: '/operations', color: '#4ADE80', requiresKyc: false },
                  { icon: Briefcase, label: t('services.exhibitor_services'), href: '/services', color: '#A78BFA', requiresKyc: false },
                  { icon: BarChart3, label: t('analytics.title'), href: '/analytics', color: '#F59E0B', requiresKyc: false },
                ] as Array<{ icon: LucideIcon; label: string; href: string; color: string; requiresKyc: boolean }>).map((action, i) => (
                  <div key={i} onClick={() => action.requiresKyc ? checkAndProceed({ redirectTo: action.href }) : window.location.assign(action.href)}>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-300 group hover:-translate-y-0.5 will-change-transform"
                      style={{ background: 'transparent' }}
                      onMouseEnter={(ev) => (ev.currentTarget.style.background = 'var(--maham-nav-hover-bg)')}
                      onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${action.color}08`, border: `1px solid ${action.color}10` }}
                      >
                        <action.icon className="w-4 h-4" style={{ color: action.color }} />
                      </div>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors flex-1">{action.label}</span>
                      <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* AI Assistant CTA */}
          <motion.div variants={item}>
            <GlassCard hover className="p-3 sm:p-5 relative overflow-hidden cursor-pointer" gold>
              {/* Decorative glow */}
              <div className="absolute -top-10 -end-10 w-32 h-32 rounded-full opacity-[0.08]"
                style={{ background: 'radial-gradient(circle, #d4a843 0%, transparent 70%)' }}
              />

              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212, 168, 67, 0.15) 0%, rgba(196,148,15,0.08) 100%)',
                    border: '1px solid rgba(212, 168, 67, 0.15)',
                  }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: '#d4a843' }} />
                </div>
                <h3 className="font-semibold text-sm text-foreground/90 mb-1.5">
                  {t('misc.maham_ai_assistant')}
                </h3>
                <p className="text-xs text-muted-foreground/60 leading-relaxed mb-4">
                  {t('expo.ask_about_the_best')}
                </p>
                <Link href="/ai-assistant">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 hover:shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #8B6914 0%, #d4a843 50%, #8B6914 100%)',
                      color: 'var(--foreground)',
                      boxShadow: 'var(--maham-btn-gold-shadow)',
                    }}
                  >
                    {t('messages.start_conversation')}
                    <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={item}>
            <GlassCard hover={false} className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: 'var(--maham-gold)' }} />
                <p className="text-xs text-muted-foreground/80 font-medium">
                  {t('common.contact_us')}
                </p>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground/50">
                <p dir="ltr">00966535555900</p>
                <p>info@mahamexpo.sa</p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
