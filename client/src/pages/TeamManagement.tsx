/*
 * Design: Fluid Obsidian Glass — Team Management with roles, permissions, and invite system
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users, Plus, Trash2, Shield, Mail, Edit3, X, CheckCircle,
  Eye, FileText, CreditCard, Building2, Settings
} from 'lucide-react';
import { toast } from 'sonner';

const roleOptions = [
  { value: 'admin', labelAr: 'مدير', labelEn: 'Admin', color: '#d4a843' },
  { value: 'manager', labelAr: 'مشرف', labelEn: 'Manager', color: '#38BDF8' },
  { value: 'viewer', labelAr: 'مشاهد', labelEn: 'Viewer', color: '#4ADE80' },
  { value: 'sales', labelAr: 'مبيعات', labelEn: 'Sales', color: '#A78BFA' },
];

const permissionOptions = [
  { key: 'view_bookings', labelAr: 'عرض الحجوزات', labelEn: 'View Bookings', icon: Eye },
  { key: 'manage_bookings', labelAr: 'إدارة الحجوزات', labelEn: 'Manage Bookings', icon: Building2 },
  { key: 'view_contracts', labelAr: 'عرض العقود', labelEn: 'View Contracts', icon: FileText },
  { key: 'manage_payments', labelAr: 'إدارة المدفوعات', labelEn: 'Manage Payments', icon: CreditCard },
  { key: 'manage_team', labelAr: 'إدارة الفريق', labelEn: 'Manage Team', icon: Users },
  { key: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: Settings },
];

export default function TeamManagement() {
  const { t, language } = useLanguage();
  const { teamMembers, addTeamMember, removeTeamMember } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [permissions, setPermissions] = useState<string[]>(['view_bookings']);

  const handleAdd = () => {
    if (!name || !email) { toast.error(t('profile.please_fill_name_and')); return; }
    const roleLabel = roleOptions.find(r => r.value === role);
    addTeamMember({ name, email, role: language === 'ar' ? (roleLabel?.labelAr || role) : (roleLabel?.labelEn || role), permissions });
    toast.success(t('team.member_added_and_invitation'));
    setName(''); setEmail(''); setRole('viewer'); setPermissions(['view_bookings']); setShowAdd(false);
  };

  const togglePermission = (key: string) => {
    setPermissions(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  return (
    <div className="page-enter space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold" >{t('team.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar' ? `${teamMembers.length} عضو في الفريق` : `${teamMembers.length} team members`}
          </p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 font-semibold text-sm">
          <Plus className="w-4 h-4 me-1" />{t('team.add_member')}
        </Button>
      </div>

      {/* Add Member Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="p-5 rounded-xl glass-card border border-[#d4a843]/20 space-y-4 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-[var(--gold-primary)]" />{t('team.add_member')}</h3>
                <button onClick={() => setShowAdd(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Input placeholder={t('team.member_name')} value={name} onChange={e => setName(e.target.value)} />
                <Input placeholder={t('profile.email')} type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              {/* Role Selection */}
              <div>
                <p className="text-sm font-medium mb-2">{t('team.role')}</p>
                <div className="flex flex-wrap gap-2">
                  {roleOptions.map(r => (
                    <button key={r.value} onClick={() => setRole(r.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 ${role === r.value ? 'border-[#d4a843]/50 bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] font-medium' : 'border-border/50 text-muted-foreground hover:bg-accent/50'}`}>
                      {language === 'ar' ? r.labelAr : r.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <p className="text-sm font-medium mb-2">{t('common.permissions')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {permissionOptions.map(p => (
                    <button key={p.key} onClick={() => togglePermission(p.key)}
                      className={`p-2.5 rounded-lg text-xs border transition-all duration-300 flex items-center gap-2 ${permissions.includes(p.key) ? 'border-green-500/30 bg-green-500/5 text-green-400' : 'border-border/50 text-muted-foreground hover:bg-accent/50'}`}>
                      {permissions.includes(p.key) ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <p.icon className="w-3.5 h-3.5" />}
                      {language === 'ar' ? p.labelAr : p.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleAdd} className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground font-semibold">
                  <Plus className="w-4 h-4 me-1" />{t('team.add_invite')}
                </Button>
                <Button variant="outline" onClick={() => setShowAdd(false)}>{t('common.cancel')}</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Members */}
      {teamMembers.length === 0 ? (
        <div className="p-12 rounded-xl glass-card text-center transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">{t('team.no_team_members_yet')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('contracts.add_team_members_to')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teamMembers.map((member, i) => {
            const roleConfig = roleOptions.find(r => r.labelAr === member.role || r.labelEn === member.role) || roleOptions[2];
            return (
              <motion.div key={member.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl glass-card hover:border-border/80 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#d4a843] to-[#8B6914] flex items-center justify-center text-foreground font-bold text-sm">{member.name.charAt(0)}</div>
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="text-[10px] border-0" style={{ backgroundColor: `${roleConfig.color}15`, color: roleConfig.color }}>
                      <Shield className="w-3 h-3 me-0.5" />{member.role}
                    </Badge>
                    <button onClick={() => { removeTeamMember(member.id); toast.success(t('team.member_removed')); }}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
                {/* Permissions */}
                {member.permissions && member.permissions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/30">
                    {member.permissions.map(p => {
                      const perm = permissionOptions.find(po => po.key === p);
                      return perm ? (
                        <span key={p} className="px-2 py-0.5 rounded-md text-[10px] bg-accent/50 text-muted-foreground">
                          {language === 'ar' ? perm.labelAr : perm.labelEn}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
