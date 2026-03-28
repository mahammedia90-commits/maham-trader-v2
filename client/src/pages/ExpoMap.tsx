/*
 * Design: Fluid Obsidian Glass — Interactive Floor Map
 * Features: Hover panel, traffic scores, booth comparison, temporary hold, zone filtering, pricing indicators
 * Data: Real API via tRPC (events.zones, events.units)
 */
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useBookingGuard } from '@/hooks/useBookingGuard';
import { useEvents, useEventUnits } from '@/hooks/useApi';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ZoomIn, ZoomOut, RotateCcw, X, MapPin,
  TrendingUp, Layers, Scale,
  Sparkles, Timer, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const HOLD_DURATION = 30 * 60; // 30 minutes in seconds

// Local types for transformed data
interface ZoneData {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BoothData {
  id: string;
  zone: string;
  type: string;
  area: number;
  price: number;
  pricePerSqm: number | null;
  status: string;
  x: number;
  y: number;
  width: number;
  height: number;
  trafficScore: number | null;
  amenities: string[];
}

// Pricing insight helper (was in mock-data)
function getPricingInsight(price: number, type: string): { label: string; labelEn: string; color: string } {
  if (type === 'island' || price > 80000) return { label: 'موقع استراتيجي - عائد مرتفع', labelEn: 'Strategic Location - High ROI', color: '#22C55E' };
  if (type === 'premium' || price > 50000) return { label: 'موقع مميز - طلب عالي', labelEn: 'Premium Spot - High Demand', color: '#d4a843' };
  if (type === 'corner' || price > 30000) return { label: 'موقع جيد - رؤية ممتازة', labelEn: 'Good Location - Great Visibility', color: '#38BDF8' };
  return { label: 'سعر تنافسي - فرصة ممتازة', labelEn: 'Competitive Price - Great Opportunity', color: '#A78BFA' };
}

// Zone colors for visual differentiation
const ZONE_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6', '#EAB308', '#6366F1', '#10B981'];

export default function ExpoMap() {
  const { t, language, isRTL } = useLanguage();
  const { addBooking } = useAuth();
  const { isDark } = useTheme();
  const { checkAndProceed } = useBookingGuard();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedBooth, setSelectedBooth] = useState<BoothData | null>(null);
  const [hoveredBooth, setHoveredBooth] = useState<BoothData | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [compareList, setCompareList] = useState<BoothData[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [activeZone, setActiveZone] = useState<string>('all');
  const [holdTimer, setHoldTimer] = useState<number>(0);
  const [heldBooth, setHeldBooth] = useState<BoothData | null>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Fetch events to get the first event ID
  const { data: events } = useEvents();
  const firstEventId = events?.[0]?.id ?? 0;

  // Fetch zones and units from API
  const { data: apiZones } = trpc.events.zones.useQuery({ eventId: firstEventId }, { enabled: firstEventId > 0 });
  const { data: apiUnits } = useEventUnits(firstEventId);

  // Transform API zones to visual format
  const zones: ZoneData[] = useMemo(() => {
    if (!apiZones || apiZones.length === 0) {
      // Fallback zones if no API data
      return [
        { id: 'A', name: 'المنطقة A - VIP', nameEn: 'Zone A - VIP', color: '#3B82F6', x: 50, y: 50, width: 350, height: 280 },
        { id: 'B', name: 'المنطقة B - بريميوم', nameEn: 'Zone B - Premium', color: '#8B5CF6', x: 430, y: 50, width: 350, height: 280 },
        { id: 'C', name: 'المنطقة C - عامة', nameEn: 'Zone C - General', color: '#EC4899', x: 810, y: 50, width: 350, height: 280 },
        { id: 'D', name: 'المنطقة D - خارجية', nameEn: 'Zone D - Outdoor', color: '#F97316', x: 50, y: 380, width: 530, height: 260 },
        { id: 'E', name: 'المنطقة E - أكشاك', nameEn: 'Zone E - Kiosks', color: '#14B8A6', x: 610, y: 380, width: 550, height: 260 },
      ];
    }
    return apiZones.map((z: any, i: number) => ({
      id: String(z.id),
      name: z.nameAr,
      nameEn: z.nameEn,
      color: z.color ?? ZONE_COLORS[i % ZONE_COLORS.length],
      x: Number(z.x ?? 0) || (50 + (i % 3) * 380),
      y: Number(z.y ?? 0) || (50 + Math.floor(i / 3) * 330),
      width: Number(z.width ?? 0) || 350,
      height: Number(z.height ?? 0) || 280,
    }));
  }, [apiZones]);

  // Transform API units to booth format
  const booths: BoothData[] = useMemo(() => {
    if (!apiUnits || apiUnits.length === 0) return [];
    return apiUnits.map((u: any) => ({
      id: u.code ?? String(u.id),
      zone: String(u.zoneId ?? ''),
      type: u.type ?? 'standard',
      area: Number(u.area ?? 0),
      price: Number(u.price ?? 0),
      pricePerSqm: u.pricePerSqm ? Number(u.pricePerSqm) : null,
      status: u.status ?? 'available',
      x: Number(u.x ?? 0),
      y: Number(u.y ?? 0),
      width: Number(u.width ?? 0) || 60,
      height: Number(u.height ?? 0) || 50,
      trafficScore: u.trafficScore ?? null,
      amenities: u.amenities ?? [],
    }));
  }, [apiUnits]);

  const expo = events?.[0];

  const filteredBooths = useMemo(() => {
    if (activeZone === 'all') return booths;
    return booths.filter(b => b.zone === activeZone);
  }, [booths, activeZone]);

  // Hold timer
  useEffect(() => {
    if (heldBooth && holdTimer > 0) {
      timerRef.current = setInterval(() => {
        setHoldTimer((prev: number) => {
          if (prev <= 1) {
            setHeldBooth(null);
            toast.error(t('misc.hold_time_expired'));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [heldBooth, language, t]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const boothColor = useCallback((booth: BoothData) => {
    if (heldBooth?.id === booth.id) return '#d4a843';
    if (selectedBooth?.id === booth.id) return '#d4a843';
    if (compareList.some(b => b.id === booth.id)) return '#A78BFA';
    switch (booth.status) {
      case 'available':
        return booth.type === 'premium' ? '#4ADE80' : booth.type === 'corner' ? '#38BDF8' : booth.type === 'island' ? '#A78BFA' : '#22C55E';
      case 'reserved': return '#F59E0B';
      case 'sold': return '#EF4444';
      default: return '#6B7280';
    }
  }, [selectedBooth, compareList, heldBooth]);

  const handleBoothClick = useCallback((booth: BoothData) => {
    if (booth.status !== 'available') {
      toast.error(t('map.booth_unavailable'));
      return;
    }
    setSelectedBooth(booth);
  }, [t]);

  const handleBoothHover = useCallback((booth: BoothData, e: React.MouseEvent) => {
    setHoveredBooth(booth);
    setHoverPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleHoldBooth = useCallback(() => {
    if (!selectedBooth) return;
    checkAndProceed({
      onVerified: () => {
        setHeldBooth(selectedBooth);
        setHoldTimer(HOLD_DURATION);
        toast.success(t('expo.booth_held_for_30'));
        setSelectedBooth(null);
      }
    });
  }, [selectedBooth, t, checkAndProceed]);

  const handleConfirmBooking = useCallback(() => {
    const booth = heldBooth || selectedBooth;
    if (!booth) return;
    checkAndProceed({
      onVerified: () => {
        const zone = zones.find(z => z.id === booth.zone);
        addBooking({
          expoId: expo?.id ? String(expo.id) : '',
          expoTitle: language === 'ar' ? (expo?.titleAr ?? '') : (expo?.titleEn ?? ''),
          boothId: booth.id,
          boothType: booth.type,
          zone: zone ? (language === 'ar' ? zone.name : zone.nameEn) : booth.zone,
          area: booth.area,
          price: booth.price,
          status: 'pending_review',
        });
        toast.success(t('bookings.booking_request_submitted'));
        setSelectedBooth(null);
        setHeldBooth(null);
        setHoldTimer(0);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    });
  }, [heldBooth, selectedBooth, addBooking, expo, language, zones, checkAndProceed, t]);

  const toggleCompare = useCallback((booth: BoothData) => {
    setCompareList(prev => {
      if (prev.some(b => b.id === booth.id)) return prev.filter(b => b.id !== booth.id);
      if (prev.length >= 3) { toast.info(t('map.max_compare')); return prev; }
      return [...prev, booth];
    });
  }, [t]);

  const handleMouseDown = (e: React.MouseEvent) => { isDragging.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; };
  const handleMouseMove = (e: React.MouseEvent) => { if (!isDragging.current) return; setPan(p => ({ x: p.x + e.clientX - lastPos.current.x, y: p.y + e.clientY - lastPos.current.y })); lastPos.current = { x: e.clientX, y: e.clientY }; };
  const handleMouseUp = () => { isDragging.current = false; };

  const stats = useMemo(() => ({
    total: booths.length,
    available: booths.filter(b => b.status === 'available').length,
    reserved: booths.filter(b => b.status === 'reserved').length,
    sold: booths.filter(b => b.status === 'sold').length,
  }), [booths]);

  // Loading state
  if (!events) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-primary)]" />
      </div>
    );
  }

  return (
    <div className="page-enter space-y-4 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold">{t('map.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' ? (expo?.titleAr ?? '') : (expo?.titleEn ?? '')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {compareList.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowCompare(true)} className="text-xs">
              <Scale className="w-3.5 h-3.5 me-1" />
              {language === 'ar' ? `مقارنة (${compareList.length})` : `Compare (${compareList.length})`}
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(z + 0.2, 3))}><ZoomIn className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}><ZoomOut className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}><RotateCcw className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: t('total'), value: stats.total, color: '#d4a843' },
          { label: t('status.available'), value: stats.available, color: '#22C55E' },
          { label: t('status.reserved'), value: stats.reserved, color: '#F59E0B' },
          { label: t('status.sold'), value: stats.sold, color: '#EF4444' },
        ].map((s, i) => (
          <div key={i} className="p-3 rounded-lg glass-card text-center">
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Zone Filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveZone('all')}
          className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 ${activeZone === 'all' ? 'bg-primary/10 text-primary border-primary/30 font-medium' : 'bg-accent/30 text-muted-foreground border-border/30'}`}>
          <Layers className="w-3 h-3 inline me-1" />{t('expo.all_zones')}
        </button>
        {zones.map(zone => (
          <button key={zone.id} onClick={() => setActiveZone(zone.id)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 ${activeZone === zone.id ? 'bg-primary/10 text-primary border-primary/30 font-medium' : 'bg-accent/30 text-muted-foreground border-border/30'}`}>
            <span className="w-2 h-2 rounded-full inline-block me-1.5" style={{ backgroundColor: zone.color }} />
            {language === 'ar' ? zone.name : zone.nameEn}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {[
          { color: '#22C55E', label: t('common.available_standard') },
          { color: '#4ADE80', label: t('common.available_premium') },
          { color: '#38BDF8', label: t('common.available_corner') },
          { color: '#A78BFA', label: t('common.available_island') },
          { color: '#F59E0B', label: t('status.reserved') },
          { color: '#EF4444', label: t('status.sold') },
          { color: '#d4a843', label: t('common.selected') },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: l.color }} />
            <span className="text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Hold Timer */}
      <AnimatePresence>
        {heldBooth && holdTimer > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-[var(--gold-primary)]/10 border border-[#d4a843]/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-[var(--gold-primary)]" />
              <div>
                <p className="text-sm font-medium">
                  {language === 'ar' ? `الجناح ${heldBooth.id} محجوز مؤقتاً` : `Booth ${heldBooth.id} on hold`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('booking_flow.complete_before_timeout')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-lg font-mono font-bold ${holdTimer < 300 ? 'text-red-400' : 'text-[var(--gold-primary)]'}`}>
                {formatTimer(holdTimer)}
              </span>
              <Button size="sm" onClick={handleConfirmBooking}
                className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground text-xs font-semibold">
                {t('common.confirm')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Canvas */}
      <div className="relative rounded-xl glass-card overflow-hidden" style={{ height: 'calc(100vh - 420px)', minHeight: '400px' }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={() => { handleMouseUp(); setHoveredBooth(null); }}>
        <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 1200 700"
          style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, cursor: isDragging.current ? 'grabbing' : 'grab' }}>
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
            </pattern>
            <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <rect width="1200" height="700" fill="url(#grid)" />

          {/* Zones */}
          {zones.map(zone => {
            const isActive = activeZone === 'all' || activeZone === zone.id;
            return (
              <g key={zone.id} opacity={isActive ? 1 : 0.2}>
                <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx="8"
                  fill={`${zone.color}08`} stroke={zone.color} strokeWidth="1.5" strokeDasharray="8 4" opacity="0.6" />
                <text x={zone.x + zone.width / 2} y={zone.y - 8} textAnchor="middle" fill={zone.color} fontSize="12" fontWeight="700">
                  {language === 'ar' ? zone.name : zone.nameEn} ({zone.id})
                </text>
              </g>
            );
          })}

          {/* Booths */}
          {filteredBooths.map(booth => {
            const isSelected = selectedBooth?.id === booth.id;
            const isHeld = heldBooth?.id === booth.id;
            const isCompare = compareList.some(b => b.id === booth.id);
            const color = boothColor(booth);
            return (
              <g key={booth.id}
                onClick={() => handleBoothClick(booth)}
                onMouseEnter={(e) => handleBoothHover(booth, e as unknown as React.MouseEvent)}
                onMouseLeave={() => setHoveredBooth(null)}
                style={{ cursor: booth.status === 'available' ? 'pointer' : 'not-allowed' }}>
                <rect x={booth.x} y={booth.y} width={booth.width} height={booth.height} rx="4"
                  fill={color}
                  opacity={booth.status === 'sold' ? 0.2 : isSelected || isHeld ? 0.9 : isCompare ? 0.8 : 0.5}
                  stroke={isSelected || isHeld ? '#d4a843' : isCompare ? '#A78BFA' : 'transparent'}
                  strokeWidth={isSelected || isHeld ? 2.5 : isCompare ? 2 : 0}
                  filter={isSelected || isHeld ? 'url(#glow)' : undefined}
                />
                <text x={booth.x + booth.width / 2} y={booth.y + booth.height / 2 - 5} textAnchor="middle" fill="white" fontSize="9" fontWeight="700">{booth.id}</text>
                <text x={booth.x + booth.width / 2} y={booth.y + booth.height / 2 + 7} textAnchor="middle" fill="white" fontSize="7" opacity="0.7">{booth.area}m²</text>
                {/* Traffic indicator */}
                {booth.status === 'available' && booth.trafficScore != null && booth.trafficScore > 85 && (
                  <circle cx={booth.x + booth.width - 5} cy={booth.y + 5} r="3" fill="#d4a843" opacity="0.9" />
                )}
              </g>
            );
          })}

          {/* Entrance */}
          <rect x="560" y="320" width="80" height="40" rx="6" fill={isDark ? '#1a1d27' : '#f5f0e0'} stroke="#d4a843" strokeWidth="1" opacity="0.8" />
          <text x="600" y="344" textAnchor="middle" fill="#d4a843" fontSize="10" fontWeight="600">
            {t('common.entrance')}
          </text>
        </svg>
      </div>

      {/* Hover Panel */}
      <AnimatePresence>
        {hoveredBooth && !selectedBooth && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 p-3 rounded-xl glass-card shadow-2xl backdrop-blur-xl pointer-events-none"
            style={{ top: hoverPos.y - 120, left: hoverPos.x + 15, maxWidth: 220 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">{hoveredBooth.id}</span>
              <Badge variant="secondary" className="text-[10px]">{t(`map.${hoveredBooth.type}`)}</Badge>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">{t('map.area')}</span><span>{hoveredBooth.area} m²</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t('map.price')}</span><span className="text-[var(--gold-primary)] font-medium">{hoveredBooth.price.toLocaleString()} {t('common.sar')}</span></div>
              {hoveredBooth.trafficScore != null && (
                <div className="flex justify-between"><span className="text-muted-foreground">{t('map.traffic')}</span>
                  <span className={hoveredBooth.trafficScore > 85 ? 'text-green-400' : hoveredBooth.trafficScore > 70 ? 'text-yellow-400' : 'text-muted-foreground'}>
                    {hoveredBooth.trafficScore}%
                  </span>
                </div>
              )}
              {hoveredBooth.pricePerSqm != null && (
                <div className="flex justify-between"><span className="text-muted-foreground">{t('common.pricem')}</span><span>{hoveredBooth.pricePerSqm.toLocaleString()} {t('common.sar')}</span></div>
              )}
            </div>
            {hoveredBooth.status === 'available' && (
              <div className="mt-2 pt-2 border-t border-border/30">
                <p className="text-[10px] text-[var(--gold-primary)]">{t('misc.click_to_select')}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Booth Panel */}
      <AnimatePresence>
        {selectedBooth && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 lg:bottom-6 start-4 end-4 lg:start-auto lg:end-6 lg:w-96 z-50 p-5 rounded-xl glass-card border border-[#d4a843]/30 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{t('booking.booth')} {selectedBooth.id}</h3>
                <Badge variant="secondary" className="text-xs mt-1">{t(`map.${selectedBooth.type}`)}</Badge>
              </div>
              <button onClick={() => setSelectedBooth(null)} className="p-1 rounded-lg hover:bg-accent/50">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Pricing Insight */}
            {(() => {
              const insight = getPricingInsight(selectedBooth.price, selectedBooth.type);
              return (
                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" style={{ backgroundColor: `${insight.color}10` }}>
                  <Sparkles className="w-4 h-4" style={{ color: insight.color }} />
                  <span className="text-xs font-medium" style={{ color: insight.color }}>
                    {language === 'ar' ? insight.label : insight.labelEn}
                  </span>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="p-2 rounded-lg bg-accent/30">
                <span className="text-[10px] text-muted-foreground block">{t('map.zone')}</span>
                <span className="font-medium">{zones.find(z => z.id === selectedBooth.zone)?.[language === 'ar' ? 'name' : 'nameEn'] ?? selectedBooth.zone}</span>
              </div>
              <div className="p-2 rounded-lg bg-accent/30">
                <span className="text-[10px] text-muted-foreground block">{t('booking.area')}</span>
                <span className="font-medium">{selectedBooth.area} m²</span>
              </div>
              <div className="p-2 rounded-lg bg-accent/30">
                <span className="text-[10px] text-muted-foreground block">{t('map.traffic')}</span>
                <span className="font-medium">{selectedBooth.trafficScore ?? 'N/A'}%</span>
              </div>
              <div className="p-2 rounded-lg bg-accent/30">
                <span className="text-[10px] text-muted-foreground block">{t('common.pricem')}</span>
                <span className="font-medium">{selectedBooth.pricePerSqm != null ? selectedBooth.pricePerSqm.toLocaleString() : 'N/A'} {t('common.sar')}</span>
              </div>
            </div>

            {/* Amenities */}
            {selectedBooth.amenities && selectedBooth.amenities.length > 0 && (
              <div className="mb-4">
                <span className="text-xs text-muted-foreground block mb-1.5">{t('common.included_amenities')}</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBooth.amenities.map((a: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[10px] px-2 py-0.5">{a}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-[var(--gold-primary)]/5 border border-[#d4a843]/20">
              <span className="text-sm text-muted-foreground">{t('booking.price')}</span>
              <span className="text-xl font-bold text-[var(--gold-primary)]">{selectedBooth.price.toLocaleString()} {t('common.sar')}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleHoldBooth} variant="outline" className="flex-1 text-sm">
                <Timer className="w-4 h-4 me-1" />
                {t('common.hold_30min')}
              </Button>
              <Button onClick={handleConfirmBooking}
                className="flex-1 bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 font-semibold text-sm">
                {t('expos.book_now')}
              </Button>
            </div>
            <button onClick={() => toggleCompare(selectedBooth)}
              className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 py-1.5">
              <Scale className="w-3 h-3" />
              {compareList.some(b => b.id === selectedBooth.id)
                ? (t('map.remove_compare'))
                : (t('map.add_compare'))}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompare && compareList.length > 0 && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowCompare(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-2xl max-h-[80vh] overflow-auto p-6 rounded-xl glass-card shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[var(--gold-primary)]" />
                  {t('map.compare_booths')}
                </h3>
                <button onClick={() => setShowCompare(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-start p-2 text-muted-foreground font-medium">{t('common.criteria')}</th>
                      {compareList.map(b => (
                        <th key={b.id} className="text-center p-2 font-semibold text-[var(--gold-primary)]">{b.id}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: t('common.type'), getValue: (b: BoothData) => t(`map.${b.type}`) },
                      { label: t('map.zone'), getValue: (b: BoothData) => zones.find(z => z.id === b.zone)?.[language === 'ar' ? 'name' : 'nameEn'] ?? '' },
                      { label: t('map.area'), getValue: (b: BoothData) => `${b.area} m²` },
                      { label: t('map.price'), getValue: (b: BoothData) => `${b.price.toLocaleString()} ${t('common.sar')}` },
                      { label: t('common.pricem'), getValue: (b: BoothData) => `${b.pricePerSqm != null ? b.pricePerSqm.toLocaleString() : 'N/A'} ${t('common.sar')}` },
                      { label: t('map.traffic'), getValue: (b: BoothData) => `${b.trafficScore ?? 'N/A'}%` },
                      { label: t('common.amenities'), getValue: (b: BoothData) => (b.amenities || []).join(', ') || '-' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border/30">
                        <td className="p-2 text-muted-foreground">{row.label}</td>
                        {compareList.map(b => (
                          <td key={b.id} className="p-2 text-center">{row.getValue(b)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => { setCompareList([]); setShowCompare(false); }}>
                  {t('notifications.clear_all')}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
