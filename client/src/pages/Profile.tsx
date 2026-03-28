/*
 * Design: Fluid Obsidian Glass — Trader Profile with stats, participation history, account settings
 * Data: tRPC hooks (real API)
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth, type Booking, type Contract } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  User, Mail, Phone, Building2, MapPin, Briefcase, Edit3, Save, Shield,
  Calendar, Globe, Award, TrendingUp, Star, FileText, CreditCard,
  CheckCircle, Lock, Eye, ArrowUpRight, type LucideIcon
} from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { t, language } = useLanguage();
  const { user, updateUser, bookings, contracts } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [company, setCompany] = useState(user?.company || '');
  const [email, setEmail] = useState(user?.email || '');

  const stats = useMemo(() => ({
    totalBookings: bookings.length,
    paidBookings: bookings.filter((b: Booking) => b.status === 'paid').length,
    totalSpent: bookings.filter((b: Booking) => b.status === 'paid').reduce((s: number, b: Booking) => s + Number(b.price ?? 0), 0),
    totalContracts: contracts.length,
    signedContracts: contracts.filter((c: Contract) => c.status === 'signed').length,
  }), [bookings, contracts]);

  const handleSave = () => {
    updateUser({ name, company, email });
    setEditing(false);
    toast.success(t('misc.changes_saved_successfully'));
  };

  const getActivityLabel = (key: string) => t(`activity.${key}`) || key;
  const getRegionLabel = (key: string) => t(`region.${key}`) || key;

  const profileFields: Array<{ icon: LucideIcon; label: string; value: string; setter: (v: string) => void; disabled: boolean }> = [
    { icon: User, label: t('profile.full_name'), value: name, setter: setName, disabled: false },
    { icon: Building2, label: t('profile.company'), value: company, setter: setCompany, disabled: false },
    { icon: Mail, label: t('profile.email'), value: email, setter: setEmail, disabled: false },
    { icon: Phone, label: t('profile.phone'), value: user?.phone || '', setter: () => {}, disabled: true },
    { icon: Briefcase, label: t('profile.activity_type'), value: getActivityLabel(user?.activityType || ''), setter: () => {}, disabled: true },
    { icon: MapPin, label: t('map.zone'), value: getRegionLabel(user?.region || ''), setter: () => {}, disabled: true },
  ];

  const quickLinks: Array<{ icon: LucideIcon; label: string; href: string; color: string }> = [
    { icon: Shield, label: t('kyc.title'), href: '/kyc', color: user?.kycStatus === 'verified' ? '#4ADE80' : '#F59E0B' },
    { icon: Building2, label: t('bookings.my_bookings'), href: '/bookings', color: '#d4a843' },
    { icon: FileText, label: t('contracts.my_contracts'), href: '/contracts', color: '#38BDF8' },
    { icon: Star, label: t('reviews.my_reviews'), href: '/reviews', color: '#A78BFA' },
  ];

  const statItems: Array<{ icon: LucideIcon; label: string; value: string | number; color: string }> = [
    { icon: Building2, label: t('dashboard.total_bookings'), value: stats.totalBookings, color: '#d4a843' },
    { icon: CheckCircle, label: t('bookings.completed_bookings'), value: stats.paidBookings, color: '#4ADE80' },
    { icon: FileText, label: t('contracts.signed_contracts'), value: `${stats.signedContracts}/${stats.totalContracts}`, color: '#38BDF8' },
    { icon: CreditCard, label: t('dashboard.total_spent'), value: `${stats.totalSpent.toLocaleString()} ${t('common.sar')}`, color: '#A78BFA' },
  ];

  return (
    <div className="page-enter space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-2xl font-bold" >{t('profile.title')}</h1>
        <Button onClick={() => editing ? handleSave() : setEditing(true)}
          className={editing ? 'bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90' : ''}
          variant={editing ? 'default' : 'outline'}>
          {editing ? <><Save className="w-4 h-4 me-1" />{t('profile.save')}</> : <><Edit3 className="w-4 h-4 me-1" />{t('profile.edit')}</>}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-3 sm:gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile Header Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-3 sm:p-6 rounded-2xl glass-card">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#d4a843] to-[#8B6914] flex items-center justify-center text-foreground text-xl sm:text-3xl font-bold shadow-lg shadow-[#d4a843]/20">
                {user?.name?.charAt(0) || 'M'}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{user?.company}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge className={`text-[10px] border-0 ${user?.kycStatus === 'verified' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    <Shield className="w-3 h-3 me-0.5" />{t(`kyc.status.${user?.kycStatus || 'pending'}`)}
                  </Badge>
                  <Badge className="bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] text-[10px] border-0">
                    <Globe className="w-3 h-3 me-0.5" />{t('common.trader')}
                  </Badge>
                  <Badge className="bg-blue-500/10 text-blue-400 text-[10px] border-0">
                    <Award className="w-3 h-3 me-0.5" />{t('team.active_member')}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Fields */}
          <div className="space-y-3">
            {profileFields.map((field, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl glass-card hover:border-border/80 transition-colors">
                <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                  <field.icon className="w-3.5 h-3.5" />{field.label}
                  {field.disabled && <span className="text-[10px] text-muted-foreground/50 ms-auto flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" />{t('common.read_only')}</span>}
                </label>
                {editing && !field.disabled ? (
                  <Input value={field.value} onChange={e => field.setter(e.target.value)} className="bg-accent/50" />
                ) : (
                  <p className="font-medium text-sm">{field.value || '-'}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Account Info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-accent/30 border border-border/30 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{t('auth.account_created')}</span>
              <span className="font-medium text-foreground">{new Date().toLocaleDateString(t('common.enus'), { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Stats & Quick Links */}
        <div className="space-y-5">
          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-5 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--gold-primary)]" />
              {t('dashboard.my_stats')}
            </h3>
            <div className="space-y-3">
              {statItems.map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-accent/30">
                  <div className="flex items-center gap-2">
                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-5 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
            <h3 className="font-semibold mb-3">{t('common.quick_links')}</h3>
            <div className="space-y-2">
              {quickLinks.map((link, i) => (
                <Link key={i} href={link.href}>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/30 transition-colors cursor-pointer">
                    <link.icon className="w-4 h-4" style={{ color: link.color }} />
                    <span className="text-sm flex-1">{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* KYC Status */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={`p-4 rounded-xl border ${user?.kycStatus === 'verified' ? 'bg-green-500/5 border-green-500/20' : 'bg-yellow-500/5 border-yellow-500/20'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`w-5 h-5 ${user?.kycStatus === 'verified' ? 'text-green-400' : 'text-yellow-400'}`} />
              <span className="font-semibold text-sm">{t('kyc.verification_status')}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {user?.kycStatus === 'verified'
                ? (t('expo.your_identity_has_been'))
                : (t('expo.please_complete_identity_verification'))}
            </p>
            {user?.kycStatus !== 'verified' && (
              <Link href="/kyc">
                <Button size="sm" className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground text-xs font-semibold">
                  {t('kyc.complete_verification')}
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
