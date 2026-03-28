/*
 * Design: Fluid Obsidian Glass — Browse Expos with advanced filters, rich cards, smart recommendations
 * Features: City/Category/Status/Price filters, Grid/List toggle, search, sorting, availability indicators
 */
import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEvents } from '@/hooks/useApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, MapPin, Calendar, Star, Users, Grid3X3, List,
  SlidersHorizontal, X, TrendingUp, ChevronDown, Building2,
  Tag, Eye, ArrowUpDown, Sparkles, Filter, Loader2
} from 'lucide-react';

type SortOption = 'date' | 'price' | 'rating' | 'availability';
type ViewMode = 'grid' | 'list';

interface EventItem {
  id: number;
  titleAr: string;
  titleEn: string;
  city: string;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  rating: string | number | null;
  expectedVisitors: number | null;
  image: string | null;
  totalUnits: number | null;
  availableUnits: number | null;
  priceRange: string | null;
  categories: string[] | null;
  isOfficial: boolean;
  venueId: number;
}

export default function BrowseExpos() {
  const { t, language, isRTL } = useLanguage();
  const { data: events, isLoading } = useEvents();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const allEvents = (events ?? []) as EventItem[];

  const cities = useMemo(() => Array.from(new Set(allEvents.map(e => e.city))), [allEvents]);
  const categories = useMemo(() => Array.from(new Set(allEvents.flatMap(e => e.categories ?? []))), [allEvents]);

  const filtered = useMemo(() => {
    let result = allEvents.filter(e => {
      const title = (language === 'ar' ? e.titleAr : e.titleEn).toLowerCase();
      const matchSearch = !search || title.includes(search.toLowerCase()) || e.city.includes(search);
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      const matchCity = cityFilter === 'all' || e.city === cityFilter;
      const matchCategory = categoryFilter === 'all' || (e.categories ?? []).some((c: string) => c === categoryFilter);
      return matchSearch && matchStatus && matchCity && matchCategory;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date': return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'rating': return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        case 'availability': return (b.availableUnits ?? 0) - (a.availableUnits ?? 0);
        default: return 0;
      }
    });
    return result;
  }, [allEvents, search, statusFilter, cityFilter, categoryFilter, sortBy, language]);

  const activeFiltersCount = [statusFilter !== 'all', cityFilter !== 'all', categoryFilter !== 'all'].filter(Boolean).length;

  const statusColors: Record<string, string> = {
    upcoming: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    active: 'bg-green-500/15 text-green-400 border-green-500/20',
    completed: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    draft: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
  };

  const formatDate = (d: Date | string) => {
    const date = new Date(d);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const availabilityBar = (available: number, total: number) => {
    if (total === 0) return null;
    const pct = (available / total) * 100;
    const color = pct > 50 ? '#4ADE80' : pct > 20 ? '#F59E0B' : '#EF4444';
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-accent/50 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full rounded-full" style={{ backgroundColor: color }} />
        </div>
        <span className="text-[10px] font-medium" style={{ color }}>{available}/{total}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold">
            {t('expos.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' ? `${allEvents.length} فعالية متاحة` : `${allEvents.length} events available`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className={viewMode === 'grid' ? 'bg-primary/10 text-primary' : ''} onClick={() => setViewMode('grid')}>
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className={viewMode === 'list' ? 'bg-primary/10 text-primary' : ''} onClick={() => setViewMode('list')}>
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('expos.search_placeholder')}
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="ps-10 bg-card border-border/50"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute top-1/2 -translate-y-1/2 end-3">
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="relative">
          <Filter className="w-4 h-4 me-2" />
          {t('common.filters')}
          {activeFiltersCount > 0 && (
            <Badge className="ms-2 h-5 min-w-5 px-1.5 bg-primary text-primary-foreground text-[10px]">{activeFiltersCount}</Badge>
          )}
        </Button>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-9 px-3 rounded-lg border border-border/50 glass-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="date">{t('common.by_date')}</option>
            <option value="rating">{t('reviews.by_rating')}</option>
            <option value="availability">{t('common.by_availability')}</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="p-4 rounded-xl glass-card space-y-4 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[var(--gold-primary)]" />
                  {t('common.advanced_filters')}
                </h3>
                {activeFiltersCount > 0 && (
                  <button onClick={() => { setStatusFilter('all'); setCityFilter('all'); setCategoryFilter('all'); }}
                    className="text-xs text-destructive hover:underline">
                    {t('notifications.clear_all')}
                  </button>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">{t('common.status')}</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'upcoming', 'active', 'completed'].map(f => (
                    <button key={f} onClick={() => setStatusFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 ${statusFilter === f
                        ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                        : 'bg-accent/30 text-muted-foreground border-border/30 hover:text-foreground'}`}>
                      {t(`expos.${f}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* City */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">{t('common.city')}</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setCityFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 ${cityFilter === 'all'
                      ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                      : 'bg-accent/30 text-muted-foreground border-border/30 hover:text-foreground'}`}>
                    {t('common.all')}
                  </button>
                  {cities.map(city => (
                    <button key={city} onClick={() => setCityFilter(city)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 ${cityFilter === city
                        ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                        : 'bg-accent/30 text-muted-foreground border-border/30 hover:text-foreground'}`}>
                      <MapPin className="w-3 h-3 inline me-1" />{city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">{t('common.category')}</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 ${categoryFilter === 'all'
                      ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                      : 'bg-accent/30 text-muted-foreground border-border/30 hover:text-foreground'}`}>
                    {t('common.all')}
                  </button>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 ${categoryFilter === cat
                        ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                        : 'bg-accent/30 text-muted-foreground border-border/30 hover:text-foreground'}`}>
                      <Tag className="w-3 h-3 inline me-1" />{cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {language === 'ar' ? `${filtered.length} فعالية` : `${filtered.length} events`}
        </span>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((expo, i) => (
            <motion.div key={expo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }}>
              <Link href={`/expos/${expo.id}`}>
                <div className="rounded-xl overflow-hidden glass-card hover:gold-border-glow transition-all duration-300 cursor-pointer group">
                  {/* Image */}
                  <div className="h-44 relative overflow-hidden">
                    {expo.image ? (
                      <img src={expo.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 will-change-transform" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--gold-primary)]/20 to-accent/30 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    {/* Status Badge */}
                    <div className="absolute top-3 start-3 flex gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border backdrop-blur-sm ${statusColors[expo.status] ?? ''}`}>
                        {t(`expos.${expo.status}`)}
                      </span>
                    </div>
                    {/* Official Badge */}
                    {expo.isOfficial && (
                      <div className="absolute top-3 end-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[var(--gold-primary)]/20 text-[var(--gold-primary)] border border-[#d4a843]/30 backdrop-blur-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {t('common.official')}
                        </span>
                      </div>
                    )}
                    {/* Title on image */}
                    <div className="absolute bottom-3 start-3 end-3">
                      <h3 className="text-white font-bold text-sm leading-tight">
                        {language === 'ar' ? expo.titleAr : expo.titleEn}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Location & Date */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-[var(--gold-primary)]" />
                        <span className="truncate">{expo.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                        <span dir="ltr">{formatDate(expo.startDate)} → {formatDate(expo.endDate)}</span>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="font-medium">{Number(expo.rating ?? 0).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{((expo.expectedVisitors ?? 0) / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        <span>{(expo.categories ?? []).length} {t('common.cats')}</span>
                      </div>
                    </div>

                    {/* Availability Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>{t('expo.available_booths')}</span>
                      </div>
                      {availabilityBar(expo.availableUnits ?? 0, expo.totalUnits ?? 0)}
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">{t('common.starts_from')}</span>
                        <span className="text-sm text-[var(--gold-primary)] font-bold">{expo.priceRange ?? '—'} {t('common.sar')}</span>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 text-xs font-semibold h-8 px-3">
                        {t('common.view_details')}
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filtered.map((expo, i) => (
            <motion.div key={expo.id} initial={{ opacity: 0, x: isRTL ? 20 : -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}>
              <Link href={`/expos/${expo.id}`}>
                <div className="flex gap-4 p-4 rounded-xl glass-card hover:gold-border-glow transition-all duration-300 cursor-pointer group">
                  {/* Image */}
                  <div className="w-36 h-28 rounded-lg overflow-hidden shrink-0 hidden sm:block">
                    {expo.image ? (
                      <img src={expo.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--gold-primary)]/20 to-accent/30 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[expo.status] ?? ''}`}>
                            {t(`expos.${expo.status}`)}
                          </span>
                          {expo.isOfficial && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--gold-primary)]/15 text-[var(--gold-primary)] border border-[#d4a843]/20">
                              <Sparkles className="w-2.5 h-2.5 inline me-0.5" />{t('common.official')}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm truncate">
                          {language === 'ar' ? expo.titleAr : expo.titleEn}
                        </h3>
                      </div>
                      <span className="text-sm text-[var(--gold-primary)] font-bold whitespace-nowrap">{expo.priceRange ?? '—'} {t('common.sar')}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[var(--gold-primary)]" />{expo.city}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-400" /><span dir="ltr">{formatDate(expo.startDate)}</span></span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{Number(expo.rating ?? 0).toFixed(1)}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{((expo.expectedVisitors ?? 0) / 1000).toFixed(0)}K</span>
                    </div>

                    <div className="max-w-xs">
                      {availabilityBar(expo.availableUnits ?? 0, expo.totalUnits ?? 0)}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-12 rounded-xl glass-card text-center transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">{t('expos.no_results')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('misc.try_changing_filters_or')}</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setStatusFilter('all'); setCityFilter('all'); setCategoryFilter('all'); }}>
            {t('expos.clear_filters')}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
