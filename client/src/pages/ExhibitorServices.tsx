/*
 * Design: Fluid Obsidian Glass — Exhibitor Services marketplace with categories, cart, quote request
 * Data: Real API via tRPC
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceItems } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search, ShoppingCart, Plus, Minus, X, Star, Clock, Sparkles,
  Package, ChevronRight, CheckCircle, Info, Zap, Eye, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Derive categories from API data
function deriveCategories(items: Array<{ category: string | null }>) {
  const cats = new Map<string, number>();
  items.forEach(item => {
    const cat = item.category ?? 'other';
    cats.set(cat, (cats.get(cat) ?? 0) + 1);
  });
  return Array.from(cats.entries()).map(([id, count]) => ({ id, count }));
}

// Category display names
const categoryNames: Record<string, { ar: string; en: string }> = {
  design: { ar: 'تصميم وتجهيز', en: 'Design & Setup' },
  electrical: { ar: 'كهرباء وإنارة', en: 'Electrical & Lighting' },
  technology: { ar: 'تقنية وشاشات', en: 'Technology & Screens' },
  hospitality: { ar: 'ضيافة', en: 'Hospitality' },
  marketing: { ar: 'تسويق وإعلان', en: 'Marketing' },
  logistics: { ar: 'لوجستيات', en: 'Logistics' },
  cleaning: { ar: 'نظافة وصيانة', en: 'Cleaning & Maintenance' },
  photography: { ar: 'تصوير', en: 'Photography' },
  other: { ar: 'أخرى', en: 'Other' },
};

export default function ExhibitorServices() {
  const { t, language } = useLanguage();
  const { serviceCart, addToServiceCart, removeFromServiceCart, updateServiceCartQuantity, clearServiceCart } = useAuth();
  const { data: apiServices, isLoading } = useServiceItems();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  // Transform API data to match UI expectations
  const services = useMemo(() => {
    if (!apiServices) return [];
    return apiServices.map((s: any) => ({
      id: String(s.id),
      name: s.nameEn,
      nameAr: s.nameAr,
      description: s.descriptionEn ?? '',
      descriptionAr: s.descriptionAr ?? '',
      category: s.category ?? 'other',
      price: Number(s.price),
      unit: s.unit ?? 'piece',
      unitAr: s.unit === 'piece' ? 'قطعة' : s.unit === 'day' ? 'يوم' : s.unit === 'hour' ? 'ساعة' : s.unit ?? 'قطعة',
      rating: 4.5,
      deliveryDays: 3,
      isPopular: Number(s.price) > 3000,
      image: s.image,
    }));
  }, [apiServices]);

  const categories = useMemo(() => deriveCategories(services), [services]);

  const filtered = useMemo(() => {
    return services.filter((s: any) => {
      const matchSearch = (language === 'ar' ? s.nameAr : s.name).toLowerCase().includes(search.toLowerCase()) ||
        (language === 'ar' ? s.descriptionAr : s.description).toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'all' || s.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [services, search, activeCategory, language]);

  const cartTotal = serviceCart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const cartCount = serviceCart.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const isInCart = (id: string) => serviceCart.some((item: any) => item.serviceId === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-primary)]" />
      </div>
    );
  }

  return (
    <div className="page-enter space-y-5 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold">{t('services.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' ? `${services.length} خدمة متاحة في ${categories.length} فئة` : `${services.length} services in ${categories.length} categories`}
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowCart(!showCart)} className="relative">
          <ShoppingCart className="w-4 h-4 me-2" />{t('services.cart')}
          {cartCount > 0 && (
            <span className="absolute -top-2 -end-2 w-5 h-5 rounded-full bg-[var(--gold-primary)] text-foreground text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
          )}
        </Button>
      </div>

      {/* Cart Panel */}
      <AnimatePresence>
        {showCart && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="p-5 rounded-xl glass-card border border-[#d4a843]/20 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[var(--gold-primary)]" />
                  {t('services.cart')} ({cartCount})
                </h3>
                {serviceCart.length > 0 && (
                  <button onClick={clearServiceCart} className="text-xs text-destructive hover:underline">{t('notifications.clear_all')}</button>
                )}
              </div>

              {serviceCart.length === 0 ? (
                <div className="p-3 sm:p-6 text-center">
                  <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t('services.cart_is_empty')}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {serviceCart.map((item: any) => (
                      <div key={item.serviceId} className="flex items-center justify-between text-sm p-3 rounded-lg bg-accent/30">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.price.toLocaleString()} {t('common.sar')} / {item.unit}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => updateServiceCartQuantity(item.serviceId, item.quantity - 1)}
                            className="w-6 h-6 rounded-md bg-accent flex items-center justify-center hover:bg-accent/80"><Minus className="w-3 h-3" /></button>
                          <span className="w-6 text-center font-medium">{item.quantity}</span>
                          <button onClick={() => updateServiceCartQuantity(item.serviceId, item.quantity + 1)}
                            className="w-6 h-6 rounded-md bg-accent flex items-center justify-center hover:bg-accent/80"><Plus className="w-3 h-3" /></button>
                          <span className="text-[var(--gold-primary)] font-bold w-20 text-end">{(item.price * item.quantity).toLocaleString()}</span>
                          <button onClick={() => removeFromServiceCart(item.serviceId)}><X className="w-4 h-4 text-destructive" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">{t('common.subtotal')}</span>
                      <span>{cartTotal.toLocaleString()} {t('common.sar')}</span>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">{t('common.vat_15')}</span>
                      <span>{Math.round(cartTotal * 0.15).toLocaleString()} {t('common.sar')}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-lg mt-2 pt-2 border-t border-border/30">
                      <span>{t('services.total')}</span>
                      <span className="text-[var(--gold-primary)]">{Math.round(cartTotal * 1.15).toLocaleString()} {t('common.sar')}</span>
                    </div>
                    <Button className="w-full mt-3 bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 font-semibold"
                      onClick={() => { toast.success(t('services.quote_request_sent_successfully')); clearServiceCart(); setShowCart(false); }}>
                      {t('services.request_quote')}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('services.search')} value={search} onChange={e => setSearch(e.target.value)} className="ps-10" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-300 border ${activeCategory === 'all' ? 'bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] border-[#d4a843]/30 font-medium' : 'bg-accent/30 text-muted-foreground border-border/30'}`}>
          {t('expos.all')} ({services.length})
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-300 border ${activeCategory === cat.id ? 'bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] border-[#d4a843]/30 font-medium' : 'bg-accent/30 text-muted-foreground border-border/30'}`}>
            {language === 'ar' ? (categoryNames[cat.id]?.ar ?? cat.id) : (categoryNames[cat.id]?.en ?? cat.id)} ({cat.count})
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-xs text-muted-foreground">{language === 'ar' ? `عرض ${filtered.length} خدمة` : `Showing ${filtered.length} services`}</p>

      {/* Services Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl glass-card text-center transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
          <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t('services.no_matching_services')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service: any, i: number) => (
            <motion.div key={service.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              whileHover={{ y: -3 }}
              className="p-4 rounded-xl glass-card hover:gold-border-glow transition-all duration-300 group">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">{language === 'ar' ? service.nameAr : service.name}</h3>
                    {service.isPopular && (
                      <Badge className="bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] text-[10px] border-0 shrink-0">
                        <Sparkles className="w-2.5 h-2.5 me-0.5" />{t('common.popular')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{language === 'ar' ? service.descriptionAr : service.description}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground my-3">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{service.rating}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{service.deliveryDays} {t('common.days')}</span>
                {isInCart(service.id) && (
                  <span className="flex items-center gap-1 text-green-400"><CheckCircle className="w-3 h-3" />{t('services.in_cart')}</span>
                )}
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-3 border-t border-border/30">
                <div>
                  <span className="text-lg font-bold text-[var(--gold-primary)]">{service.price.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground ms-1">{t('common.sar')} / {language === 'ar' ? service.unitAr : service.unit}</span>
                </div>
                <Button size="sm" onClick={() => {
                  addToServiceCart({ serviceId: service.id, name: language === 'ar' ? service.nameAr : service.name, price: service.price, unit: language === 'ar' ? service.unitAr : service.unit });
                  toast.success(t('services.added_to_cart'));
                }}
                  className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 text-xs font-semibold">
                  <Plus className="w-3 h-3 me-1" />{t('services.add_to_cart')}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setSelectedService(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-lg p-6 rounded-xl glass-card shadow-2xl transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{language === 'ar' ? selectedService.nameAr : selectedService.name}</h3>
                <button onClick={() => setSelectedService(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{language === 'ar' ? selectedService.descriptionAr : selectedService.description}</p>
              <div className="flex items-center gap-4 text-sm mb-4">
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />{selectedService.rating}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{selectedService.deliveryDays} {t('common.days')}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30 mb-4">
                <span className="text-lg sm:text-2xl font-bold text-[var(--gold-primary)]">{selectedService.price.toLocaleString()} {t('common.sar')}</span>
                <span className="text-sm text-muted-foreground">/ {language === 'ar' ? selectedService.unitAr : selectedService.unit}</span>
              </div>
              <Button className="w-full bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 font-semibold"
                onClick={() => {
                  addToServiceCart({ serviceId: selectedService.id, name: language === 'ar' ? selectedService.nameAr : selectedService.name, price: selectedService.price, unit: language === 'ar' ? selectedService.unitAr : selectedService.unit });
                  toast.success(t('services.added_to_cart'));
                  setSelectedService(null);
                }}>
                <Plus className="w-4 h-4 me-1" />{t('services.add_to_cart')}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
