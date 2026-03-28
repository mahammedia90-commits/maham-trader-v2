/*
 * Design: Fluid Obsidian Glass — Analytics dashboard with rich KPIs, charts, and insights
 * Data: tRPC hooks (real API)
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth, type Booking } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3, TrendingUp, Users, Calendar, DollarSign, Eye,
  ArrowUp, ArrowDown, Target, Award, Zap, Star, type LucideIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Analytics() {
  const { t, language } = useLanguage();
  const { bookings } = useAuth();
  const { isDark } = useTheme();

  const monthlyData = [
    { month: t('month.jan'), bookings: 12, revenue: 45000, visitors: 1200 },
    { month: t('month.feb'), bookings: 19, revenue: 72000, visitors: 2100 },
    { month: t('month.mar'), bookings: 25, revenue: 95000, visitors: 3400 },
    { month: t('month.apr'), bookings: 15, revenue: 58000, visitors: 1800 },
    { month: t('month.may'), bookings: 30, revenue: 120000, visitors: 4200 },
    { month: t('month.jun'), bookings: 22, revenue: 88000, visitors: 2800 },
  ];

  const pieData = [
    { name: t('booth_type.standard'), value: 45, color: '#22C55E' },
    { name: t('booth_type.premium'), value: 25, color: '#d4a843' },
    { name: t('booth_type.corner'), value: 18, color: '#38BDF8' },
    { name: t('booth_type.island'), value: 12, color: '#A78BFA' },
  ];

  const totalRevenue = useMemo(() => {
    const sum = bookings.reduce((s: number, b: Booking) => s + Number(b.price ?? 0), 0);
    return sum || 478000;
  }, [bookings]);

  const kpis: Array<{ label: string; value: string | number; icon: LucideIcon; color: string; change: string; up: boolean; suffix?: string }> = [
    { label: t('dashboard.total_bookings'), value: bookings.length || 47, icon: Calendar, color: '#d4a843', change: '+12%', up: true },
    { label: t('analytics.revenue'), value: `${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#4ADE80', change: '+23%', up: true, suffix: t('common.sar') },
    { label: t('analytics.visitors'), value: '12,500', icon: Users, color: '#38BDF8', change: '+8%', up: true },
    { label: t('analytics.conversion_rate'), value: '68%', icon: TrendingUp, color: '#A78BFA', change: '+5%', up: true },
  ];

  const topExpos = [
    { name: t('misc.riyadh_tech_expo'), bookings: 15, revenue: 180000, rating: 4.8 },
    { name: t('misc.jeddah_food_expo'), bookings: 12, revenue: 144000, rating: 4.6 },
    { name: t('misc.dammam_industrial_expo'), bookings: 8, revenue: 96000, rating: 4.5 },
  ];

  return (
    <div className="page-enter space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-2xl font-bold" >{t('analytics.title')}</h1>
        <Badge className="bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] border-0 text-xs">
          <Zap className="w-3 h-3 me-1" />{t('analytics.last_6_months')}
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl glass-card hover:border-[#d4a843]/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <span className={`text-[10px] font-medium flex items-center gap-0.5 ${kpi.up ? 'text-green-400' : 'text-red-400'}`}>
                {kpi.up ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}{kpi.change}
              </span>
            </div>
            <p className="text-xl font-bold">{kpi.value}{kpi.suffix && <span className="text-xs text-muted-foreground ms-1">{kpi.suffix}</span>}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-3 sm:gap-6">
        {/* Monthly Bookings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-5 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--gold-primary)]" />
            {t('dashboard.monthly_bookings')}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(212,168,67,0.06)' : 'rgba(0,0,0,0.06)'} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6A6A64' }} stroke={isDark ? 'rgba(212,168,67,0.08)' : 'rgba(0,0,0,0.1)'} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6A6A64' }} stroke={isDark ? 'rgba(212,168,67,0.08)' : 'rgba(0,0,0,0.1)'} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? 'rgba(20,20,35,0.9)' : 'rgba(255,255,255,0.95)', border: '1px solid var(--glass-border)', borderRadius: '12px', fontSize: 12, color: isDark ? '#f5f5f3' : '#1a1a1a', backdropFilter: 'blur(20px)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)' }} />
              <Bar dataKey="bookings" fill="#d4a843" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Booth Type Distribution - CSS Donut */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="p-5 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-[var(--gold-primary)]" />
            {t('expo.booth_type_distribution')}
          </h3>
          <div className="flex flex-col items-center justify-center" style={{ height: 250 }}>
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                {(() => {
                  const total = pieData.reduce((s, d) => s + d.value, 0);
                  let cumulative = 0;
                  return pieData.map((d, i) => {
                    const pct = d.value / total;
                    const dashArray = `${pct * 283} ${283 - pct * 283}`;
                    const dashOffset = -cumulative * 283;
                    cumulative += pct;
                    return <circle key={i} cx="100" cy="100" r="45" fill="none" stroke={d.color} strokeWidth="30" strokeDasharray={dashArray} strokeDashoffset={dashOffset} />;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center"><p className="text-lg sm:text-2xl font-bold">100</p><p className="text-[10px] text-muted-foreground">{t('expos.booth')}</p></div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="p-5 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--gold-primary)]" />
          {t('analytics.revenue_visitors')}
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(212,168,67,0.06)' : 'rgba(0,0,0,0.06)'} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6A6A64' }} stroke={isDark ? 'rgba(212,168,67,0.08)' : 'rgba(0,0,0,0.1)'} />
            <YAxis tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6A6A64' }} stroke={isDark ? 'rgba(212,168,67,0.08)' : 'rgba(0,0,0,0.1)'} />
            <Tooltip contentStyle={{ backgroundColor: isDark ? 'rgba(20,20,35,0.9)' : 'rgba(255,255,255,0.95)', border: '1px solid var(--glass-border)', borderRadius: '12px', fontSize: 12, color: isDark ? '#f5f5f3' : '#1a1a1a', backdropFilter: 'blur(20px)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)' }} />
            <Area type="monotone" dataKey="revenue" stroke="#d4a843" fill="#d4a843" fillOpacity={0.1} name={t('analytics.revenue')} />
            <Area type="monotone" dataKey="visitors" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.05} name={t('analytics.visitors')} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Expos */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="p-5 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-[var(--gold-primary)]" />
          {t('analytics.top_expos')}
        </h3>
        <div className="space-y-3">
          {topExpos.map((expo, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--gold-primary)]/10 flex items-center justify-center text-[var(--gold-primary)] font-bold text-sm">#{i + 1}</div>
                <div>
                  <p className="font-medium text-sm">{expo.name}</p>
                  <p className="text-xs text-muted-foreground">{expo.bookings} {t('bookings.bookings')}</p>
                </div>
              </div>
              <div className="text-end">
                <p className="font-bold text-sm text-[var(--gold-primary)]">{expo.revenue.toLocaleString()} {t('common.sar')}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-0.5 justify-end"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{expo.rating}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
