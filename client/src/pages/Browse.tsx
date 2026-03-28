/*
 * Design: Fluid Obsidian Glass — Public expo browsing page
 */
import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEvents } from '@/hooks/useApi';
import { HERO_IMAGE } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Calendar, Users, Star, Sun, Moon, Building2, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function Browse() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const { data: events, isLoading } = useEvents();

  const filtered = (events ?? []).filter((e: any) => {
    const title = (language === 'ar' ? (e.titleAr ?? '') : (e.titleEn ?? '')).toLowerCase();
    const city = (e.city ?? '').toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = title.includes(q) || city.includes(q);
    const matchFilter = filter === 'all' || e.status === filter;
    return matchSearch && matchFilter;
  });

  const formatDate = (d: Date | string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="page-enter min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4a843] to-[#8B6914] flex items-center justify-center text-foreground font-bold text-sm">M</div>
              <span className="font-bold gold-gradient-text text-lg hidden sm:block">{t('brand.name')}</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="px-3 py-1.5 rounded-lg text-xs font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors">
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 text-sm font-semibold">{t('home.hero.cta')}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-16 relative">
        <div className="h-48 relative overflow-hidden">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <h1 className="text-xl sm:text-3xl font-bold gold-gradient-text">
              {t('expos.title')}
            </h1>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground/60" />
            <Input
              placeholder={t('expos.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground/60 ps-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'upcoming', 'active', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === f ? 'bg-[var(--gold-primary)]/15 text-[var(--gold-primary)] font-medium border border-[#d4a843]/30' : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'}`}
              >
                {t(`expos.${f}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-primary)]" />
          </div>
        )}

        {/* Expo Grid */}
        {!isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filtered.map((expo: any, i: number) => (
              <motion.div
                key={expo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Link href={`/expos/${expo.id}`}>
                  <div className="rounded-2xl overflow-hidden bg-foreground/[0.03] border border-border hover:gold-border-glow transition-all duration-300 cursor-pointer">
                    <div className="h-44 relative">
                      {expo.image ? (
                        <img src={expo.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--gold-primary)]/20 to-accent/30 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute top-3 start-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                          expo.status === 'upcoming' ? 'bg-blue-500/20 text-blue-300' :
                          expo.status === 'active' ? 'bg-green-500/20 text-green-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {t(`expos.${expo.status}`)}
                        </span>
                      </div>
                      {expo.isOfficial && (
                        <div className="absolute top-3 end-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[var(--gold-primary)]/20 text-[var(--gold-primary)]">
                            {t('common.official')}
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-3 start-3 end-3">
                        <h3 className="text-foreground font-semibold text-sm truncate">{language === 'ar' ? expo.titleAr : expo.titleEn}</h3>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{expo.city ?? ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span dir="ltr">{formatDate(expo.startDate)} → {formatDate(expo.endDate)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          <span>{(expo.expectedVisitors ?? 0).toLocaleString()} {t('expos.visitors')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
                          <span className="text-xs text-[var(--gold-primary)]">{Number(expo.rating ?? 0).toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-400">{expo.availableUnits ?? 0} {t('expos.booths')}</span>
                        <span className="text-xs text-[var(--gold-primary)] font-medium">{expo.priceRange ?? '—'} {t('common.sar')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{t('common.no_data')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
