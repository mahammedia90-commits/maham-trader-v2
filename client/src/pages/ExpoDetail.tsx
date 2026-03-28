/*
 * Design: Fluid Obsidian Glass — Expo Detail with zones, units, demographics, highlights, booking CTA
 * Updated: Real data from API
 */
import { useRoute, Link, useLocation } from 'wouter';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBookingGuard } from '@/hooks/useBookingGuard';
import { useEventDetail, useEvents } from '@/hooks/useApi';
// Company info from user profile (will come from API later)
const companyInfo = {
  brandAr: 'شركتي',
  brandEn: 'My Company',
  nameAr: 'التاجر',
  nameEn: 'Trader',
  phone: '+966 50 000 0000',
  email: 'trader@example.com',
  rentEmail: 'rent@mahamexpo.sa',
  website: 'https://mahamexpo.sa',
};
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin, Calendar, Users, Star, ArrowLeft, ArrowRight, Tag,
  Building2, TrendingUp, Eye, Share2, Heart, Clock, Sparkles,
  Globe, CheckCircle, BarChart3, Megaphone, ChevronDown, ChevronUp,
  Store, Utensils, ShoppingBag, Map, Phone, Mail, ExternalLink, Loader2
} from 'lucide-react';

interface ZoneItem {
  id: number;
  nameAr: string;
  nameEn: string;
  description: string | null;
  color: string | null;
  x: string | null;
  y: string | null;
  width: string | null;
  height: string | null;
}

interface UnitItem {
  id: number;
  code: string;
  type: string;
  area: string;
  price: string;
  status: string;
  zoneId: number | null;
}

export default function ExpoDetail() {
  const [, params] = useRoute('/expos/:id');
  const { t, language, isRTL } = useLanguage();
  const { checkAndProceed } = useBookingGuard();
  const [, navigate] = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedZone, setExpandedZone] = useState<number | null>(null);

  const eventId = Number(params?.id) || 0;
  const { data: detail, isLoading } = useEventDetail(eventId);
  const { data: allEvents } = useEvents();

  const expo = detail?.event;
  const venue = detail?.venue;
  const zones = (detail?.zones ?? []) as unknown as ZoneItem[];
  const units = (detail?.units ?? []) as unknown as UnitItem[];

  const zoneUnits = useMemo(() => {
    if (!expandedZone) return [];
    return units.filter(u => u.zoneId === expandedZone);
  }, [expandedZone, units]);

  const otherEvents = useMemo(() => {
    return (allEvents ?? []).filter((e: any) => e.id !== eventId).slice(0, 3);
  }, [allEvents, eventId]);

  const formatDate = (d: Date | string | null) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-primary)]" />
      </div>
    );
  }

  if (!expo) return (
    <div className="p-12 rounded-xl glass-card text-center">
      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">{t('common.no_data')}</p>
      <Button variant="outline" className="mt-4" onClick={() => navigate('/expos')}>
        {t('expo.back_to_expos')}
      </Button>
    </div>
  );

  const statusColors: Record<string, string> = {
    upcoming: 'bg-blue-500/15 text-blue-400',
    active: 'bg-green-500/15 text-green-400',
    completed: 'bg-gray-500/15 text-gray-400',
    draft: 'bg-yellow-500/15 text-yellow-400',
    cancelled: 'bg-red-500/15 text-red-400',
  };

  const totalUnits = expo.totalUnits ?? 0;
  const availableUnits = expo.availableUnits ?? 0;
  const availPct = totalUnits > 0 ? (availableUnits / totalUnits) * 100 : 0;
  const availColor = availPct > 50 ? '#4ADE80' : availPct > 20 ? '#F59E0B' : '#EF4444';

  const typeIcons: Record<string, typeof Store> = { retail: ShoppingBag, fnb: Utensils, kiosk: Store };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Back Button */}
      <button onClick={() => navigate('/expos')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
        {isRTL ? <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform will-change-transform" /> : <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform will-change-transform" />}
        {t('expo.back_to_expos')}
      </button>

      {/* Hero Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden relative">
        <div className="h-56 lg:h-80 relative">
          {expo.image ? (
            <img src={expo.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--gold-primary)]/20 to-accent/30 flex items-center justify-center">
              <Building2 className="w-20 h-20 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute top-4 end-4 flex gap-2">
            <button onClick={() => setIsFavorite(!isFavorite)}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-400 text-red-400' : 'text-white'}`} />
            </button>
            <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
              <Share2 className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="absolute top-4 start-4 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${statusColors[expo.status] ?? ''}`}>
              {t(`expos.${expo.status}`)}
            </span>
            {expo.isOfficial && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--gold-primary)]/20 text-[var(--gold-primary)] backdrop-blur-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />{t('common.official')}
              </span>
            )}
          </div>
          <div className="absolute bottom-4 start-4 end-4">
            <h1 className="text-2xl lg:text-xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {language === 'ar' ? expo.titleAr : expo.titleEn}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/90">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{expo.city}{venue ? ` — ${venue.nameEn}` : ''}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /><span dir="ltr">{formatDate(expo.startDate)} → {formatDate(expo.endDate)}</span></span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-3 sm:gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Star, color: '#F59E0B', value: `${Number(expo.rating ?? 0).toFixed(1)}/5`, label: t('reviews.rating') },
              { icon: Users, color: '#4ADE80', value: (expo.expectedVisitors ?? 0).toLocaleString(), label: t('common.expected_visitors') },
              { icon: Building2, color: '#38BDF8', value: `${totalUnits}`, label: language === 'ar' ? 'إجمالي الوحدات' : 'Total Units' },
              { icon: TrendingUp, color: '#d4a843', value: `${availableUnits}`, label: t('status.available') },
            ].map((stat, i) => (
              <div key={i} className="p-3 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
                <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* About */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="p-5 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--gold-primary)]" />
              {t('expo.about')}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{language === 'ar' ? (expo.descriptionAr ?? '') : (expo.descriptionEn ?? '')}</p>
          </motion.div>

          {/* Company Info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="p-5 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--gold-primary)]" />
              {t('expo.organizer')}
            </h2>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-accent/30">
              <div className="w-12 h-12 rounded-xl bg-[var(--gold-primary)]/10 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-[var(--gold-primary)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm">{language === 'ar' ? companyInfo.brandAr : companyInfo.brandEn}</p>
                <p className="text-xs text-muted-foreground">{language === 'ar' ? companyInfo.nameAr : companyInfo.nameEn}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[var(--gold-primary)]" /><span dir="ltr">{companyInfo.phone}</span></div>
              <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[var(--gold-primary)]" />{companyInfo.email}</div>
              <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[var(--gold-primary)]" />{companyInfo.rentEmail}</div>
              <div className="flex items-center gap-2"><ExternalLink className="w-3.5 h-3.5 text-[var(--gold-primary)]" />{companyInfo.website}</div>
            </div>
          </motion.div>

          {/* Categories */}
          {(expo.categories ?? []).length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="p-5 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[var(--gold-primary)]" />
                {t('expo.categories')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(expo.categories as string[] ?? []).map((cat: string, i: number) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1.5 text-xs">
                    <Tag className="w-3 h-3 me-1.5" />{cat}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* ========== ZONES SECTION ========== */}
          {zones.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
              className="p-5 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Map className="w-4 h-4 text-[var(--gold-primary)]" />
                {language === 'ar' ? `المناطق (${zones.length} مناطق)` : `Zones (${zones.length} zones)`}
              </h2>

              <div className="grid sm:grid-cols-2 gap-3">
                {zones.map((zone, i) => {
                  const isExpanded = expandedZone === zone.id;
                  return (
                    <motion.div
                      key={zone.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="rounded-xl overflow-hidden border border-border/50 hover:border-[#d4a843]/30 transition-all duration-300"
                    >
                      {/* Zone Image */}
                      <div className="h-32 relative">
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: zone.color ?? 'rgba(212,168,67,0.1)' }}>
                          <Map className="w-8 h-8 text-white/40" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-2 start-3 end-3">
                          <h3 className="text-sm font-bold text-white drop-shadow">{language === 'ar' ? zone.nameAr : zone.nameEn}</h3>
                        </div>
                        <div className="absolute top-2 end-2">
                          <Badge className="bg-[var(--gold-primary)]/90 text-white text-[10px] px-2 py-0.5">
                            {units.filter(u => u.zoneId === zone.id).length} {t('common.unit')}
                          </Badge>
                        </div>
                      </div>

                      {/* Zone Info */}
                      <div className="p-3 bg-card">
                        {zone.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">
                            {zone.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">
                              {t('common.available')} <span className="font-bold text-[#4ADE80]">{units.filter(u => u.zoneId === zone.id && u.status === 'available').length}</span>/{units.filter(u => u.zoneId === zone.id).length}
                            </span>
                          </div>

                          <button
                            onClick={() => setExpandedZone(isExpanded ? null : zone.id)}
                            className="text-[10px] text-[var(--gold-primary)] hover:underline flex items-center gap-1"
                          >
                            {isExpanded ? t('expo.hide_units') : t('expo.view_units')}
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Expanded Units */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                                {zoneUnits.length > 0 ? zoneUnits.map((unit) => {
                                  const Icon = typeIcons[unit.type] || Store;
                                  return (
                                    <div key={unit.id} className="flex items-center justify-between p-2 rounded-lg bg-accent/20 hover:bg-accent/40 transition-colors">
                                      <div className="flex items-center gap-2">
                                        <Icon className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
                                        <div>
                                          <p className="text-xs font-medium">{unit.code}</p>
                                          <p className="text-[9px] text-muted-foreground">{unit.type} — {unit.area} م²</p>
                                        </div>
                                      </div>
                                      <div className="text-end">
                                        <p className="text-xs font-bold text-[var(--gold-primary)]">{Number(unit.price).toLocaleString()}</p>
                                        <p className="text-[9px] text-muted-foreground">{t('common.sar')}</p>
                                      </div>
                                    </div>
                                  );
                                }) : (
                                  <p className="text-xs text-muted-foreground text-center py-2">{language === 'ar' ? 'لا توجد وحدات' : 'No units'}</p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Booking Sidebar */}
        <div className="space-y-4">
          {/* Booking Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="p-5 rounded-xl glass-card gold-border-glow sticky top-4 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--gold-primary)]" />
              {t('expo.booking_info')}
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('expo.available_units')}</span>
                <span className="font-medium" style={{ color: availColor }}>{availableUnits}/{totalUnits}</span>
              </div>
              <div className="h-2 rounded-full bg-accent/50 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${availPct}%` }}
                  transition={{ duration: 1 }} className="h-full rounded-full" style={{ backgroundColor: availColor }} />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-accent/30 mb-4">
              <span className="text-xs text-muted-foreground block mb-1">{t('expo.price_range')}</span>
              <span className="text-xl font-bold text-[var(--gold-primary)]">{expo.priceRange ?? '—'}</span>
              <span className="text-sm text-muted-foreground ms-1">{t('common.sar')}</span>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">{t('expo.start_date')}: </span>
                  <span className="font-medium" dir="ltr">{formatDate(expo.startDate)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">{t('expo.end_date')}: </span>
                  <span className="font-medium" dir="ltr">{formatDate(expo.endDate)}</span>
                </div>
              </div>
            </div>

            {expo.status !== 'completed' && availableUnits > 0 ? (
              <div className="space-y-2">
                <Button
                  className="w-full bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 font-semibold"
                  onClick={() => checkAndProceed({ redirectTo: '/map' })}
                >
                  <MapPin className="w-4 h-4 me-2" />
                  {t('expo.book_unit')}
                </Button>
                <Link href="/services">
                  <Button variant="outline" className="w-full">
                    {t('expo.browse_services')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-accent/30 text-center">
                <p className="text-sm text-muted-foreground">
                  {expo.status === 'completed'
                    ? t('expo.event_ended')
                    : t('expo.no_units')}
                </p>
              </div>
            )}
          </motion.div>

          {/* Contact Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-5 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[var(--gold-primary)]" />
              {t('expo.contact_booking')}
            </h3>
            <div className="space-y-2 text-sm">
              <a href={`tel:${companyInfo.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/30 transition-colors text-muted-foreground hover:text-foreground">
                <Phone className="w-4 h-4 text-[var(--gold-primary)]" /><span dir="ltr">{companyInfo.phone}</span>
              </a>
              <a href={`mailto:${companyInfo.rentEmail}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/30 transition-colors text-muted-foreground hover:text-foreground">
                <Mail className="w-4 h-4 text-[var(--gold-primary)]" />{companyInfo.rentEmail}
              </a>
            </div>
          </motion.div>

          {/* Other Events */}
          {otherEvents.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="p-5 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
              <h3 className="font-semibold mb-3">{t('expo.other_events')}</h3>
              <div className="space-y-3">
                {otherEvents.map((e: any) => (
                  <Link key={e.id} href={`/expos/${e.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors cursor-pointer">
                      {e.image ? (
                        <img src={e.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-accent/30 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{language === 'ar' ? e.titleAr : e.titleEn}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{e.city}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
