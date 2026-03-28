/**
 * Maham Expo — Operations Center (مركز العمليات)
 * Design: Obsidian Glass with 8 operation tabs
 * Tabs: Permits, Badges, Furnishing, Maintenance, Supply, Approvals, Communications, Attachments
 * Full CRUD with status tracking, forms, and file attachments
 */
import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ShieldCheck, IdCard, Sofa, Wrench, Truck, CheckSquare, MessageSquare, Paperclip,
  Plus, Search, Filter, Calendar, User, FileText, Clock, X, ChevronDown,
  Download, Eye, AlertTriangle, CheckCircle, XCircle, Loader2, ArrowUpDown,
  Building2, MapPin, Phone, Hash, Car, Package, Send, Upload, Trash2
} from 'lucide-react';

/* ─── Types ─── */
type TabId = 'permits' | 'badges' | 'furnishing' | 'maintenance' | 'supply' | 'approvals' | 'communications' | 'attachments';
type RequestStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'expired' | 'inProgress' | 'completed';
type Priority = 'high' | 'medium' | 'low';

interface OperationRequest {
  id: string;
  type: string;
  subType?: string;
  title: string;
  titleEn: string;
  description: string;
  status: RequestStatus;
  priority: Priority;
  createdAt: string;
  validFrom?: string;
  validTo?: string;
  personName?: string;
  idNumber?: string;
  purpose?: string;
  vehiclePlate?: string;
  boothId?: string;
  expoName?: string;
  attachments?: string[];
  notes?: string;
}

/* ─── Mock Data ─── */
const MOCK_PERMITS: OperationRequest[] = [
  { id: 'PRM-001', type: 'permits', subType: 'entry', title: 'تصريح دخول عمال التأثيث', titleEn: 'Furnishing Workers Entry Permit', description: 'تصريح دخول 5 عمال لتأثيث الجناح A12', status: 'approved', priority: 'high', createdAt: '2026-03-10', validFrom: '2026-03-15', validTo: '2026-03-20', personName: 'أحمد محمد', idNumber: '1234567890', purpose: 'تأثيث الجناح', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
  { id: 'PRM-002', type: 'permits', subType: 'exit', title: 'تصريح خروج معدات', titleEn: 'Equipment Exit Permit', description: 'تصريح خروج معدات العرض بعد انتهاء المعرض', status: 'pending', priority: 'medium', createdAt: '2026-03-12', personName: 'خالد العلي', purpose: 'إخراج معدات', vehiclePlate: 'ABC 1234', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
  { id: 'PRM-003', type: 'permits', subType: 'supply', title: 'تصريح توريد بضائع', titleEn: 'Supply Delivery Permit', description: 'تصريح دخول شاحنة توريد بضائع للجناح', status: 'active', priority: 'high', createdAt: '2026-03-08', validFrom: '2026-03-10', validTo: '2026-03-25', vehiclePlate: 'XYZ 5678', purpose: 'توريد بضائع عرض', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
  { id: 'PRM-004', type: 'permits', subType: 'maintenance', title: 'تصريح صيانة كهربائية', titleEn: 'Electrical Maintenance Permit', description: 'تصريح دخول فني كهرباء لصيانة الجناح', status: 'expired', priority: 'low', createdAt: '2026-02-20', validFrom: '2026-02-22', validTo: '2026-02-25', personName: 'سعد الحربي', idNumber: '9876543210', purpose: 'صيانة كهربائية', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
];

const MOCK_BADGES: OperationRequest[] = [
  { id: 'BDG-001', type: 'badges', subType: 'employee', title: 'باج موظف - محمد أحمد', titleEn: 'Employee Badge - Mohammed Ahmed', description: 'باج دخول للموظف محمد أحمد - مدير المبيعات', status: 'active', priority: 'medium', createdAt: '2026-03-01', validFrom: '2026-03-15', validTo: '2026-03-25', personName: 'محمد أحمد', idNumber: '1122334455', purpose: 'مدير مبيعات', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
  { id: 'BDG-002', type: 'badges', subType: 'employee', title: 'باج موظفة - سارة خالد', titleEn: 'Employee Badge - Sara Khalid', description: 'باج دخول للموظفة سارة خالد - مسؤولة تسويق', status: 'active', priority: 'medium', createdAt: '2026-03-01', validFrom: '2026-03-15', validTo: '2026-03-25', personName: 'سارة خالد', idNumber: '5566778899', purpose: 'مسؤولة تسويق', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
  { id: 'BDG-003', type: 'badges', subType: 'contractor', title: 'باج مقاول - شركة التأثيث', titleEn: 'Contractor Badge - Furnishing Co', description: 'باج دخول لفريق شركة التأثيث', status: 'pending', priority: 'high', createdAt: '2026-03-10', personName: 'عبدالله الشمري', idNumber: '6677889900', purpose: 'مقاول تأثيث', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
  { id: 'BDG-004', type: 'badges', subType: 'visitor', title: 'باج زائر VIP', titleEn: 'VIP Visitor Badge', description: 'باج زائر VIP لعميل مهم', status: 'approved', priority: 'low', createdAt: '2026-03-12', personName: 'فهد المطيري', purpose: 'زيارة VIP', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
];

const MOCK_FURNISHING: OperationRequest[] = [
  { id: 'FRN-001', type: 'furnishing', title: 'تأثيث الجناح الرئيسي', titleEn: 'Main Booth Furnishing', description: 'تأثيث كامل للجناح A12 يشمل طاولات عرض وكراسي وإضاءة', status: 'inProgress', priority: 'high', createdAt: '2026-03-05', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية', notes: 'يشمل 4 طاولات عرض، 8 كراسي، إضاءة LED، لوحة خلفية' },
  { id: 'FRN-002', type: 'furnishing', title: 'تركيب لوحة إعلانية', titleEn: 'Signage Installation', description: 'تركيب لوحة إعلانية مضيئة على واجهة الجناح', status: 'pending', priority: 'medium', createdAt: '2026-03-08', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
];

const MOCK_MAINTENANCE: OperationRequest[] = [
  { id: 'MNT-001', type: 'maintenance', title: 'صيانة نظام التكييف', titleEn: 'AC System Maintenance', description: 'طلب صيانة نظام التكييف في الجناح - حرارة مرتفعة', status: 'inProgress', priority: 'high', createdAt: '2026-03-14', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
  { id: 'MNT-002', type: 'maintenance', title: 'إصلاح إضاءة', titleEn: 'Lighting Repair', description: 'إصلاح مصابيح LED معطلة في الجناح', status: 'completed', priority: 'low', createdAt: '2026-03-10', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
];

const MOCK_SUPPLY: OperationRequest[] = [
  { id: 'SPL-001', type: 'supply', title: 'توريد منتجات العرض', titleEn: 'Display Products Delivery', description: 'توريد 200 قطعة من منتجات العرض للجناح', status: 'approved', priority: 'high', createdAt: '2026-03-12', vehiclePlate: 'RYD 4567', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
  { id: 'SPL-002', type: 'supply', title: 'توريد مواد تسويقية', titleEn: 'Marketing Materials Delivery', description: 'توريد بروشورات وكتالوجات ومواد دعائية', status: 'pending', priority: 'medium', createdAt: '2026-03-13', vehiclePlate: 'JED 8901', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
];

const MOCK_APPROVALS: OperationRequest[] = [
  { id: 'APR-001', type: 'approvals', title: 'موافقة تصميم الجناح', titleEn: 'Booth Design Approval', description: 'طلب موافقة على تصميم الجناح النهائي', status: 'approved', priority: 'high', createdAt: '2026-03-01', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
  { id: 'APR-002', type: 'approvals', title: 'موافقة تعديل ساعات العمل', titleEn: 'Working Hours Change Approval', description: 'طلب تمديد ساعات العمل حتى 11 مساءً', status: 'pending', priority: 'medium', createdAt: '2026-03-11', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
];

const MOCK_COMMS: OperationRequest[] = [
  { id: 'COM-001', type: 'communications', title: 'استفسار عن مواعيد التحميل', titleEn: 'Loading Schedule Inquiry', description: 'استفسار عن مواعيد التحميل والتفريغ المسموحة', status: 'completed', priority: 'medium', createdAt: '2026-03-09', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية', notes: 'تم الرد: مواعيد التحميل من 6 صباحاً حتى 10 صباحاً' },
  { id: 'COM-002', type: 'communications', title: 'طلب تغيير موقع الجناح', titleEn: 'Booth Relocation Request', description: 'طلب نقل الجناح إلى موقع أفضل بالقرب من المدخل', status: 'pending', priority: 'high', createdAt: '2026-03-13', boothId: 'A12', expoName: 'معرض الرياض الدولي للتقنية' },
];

const MOCK_ATTACHMENTS: OperationRequest[] = [
  { id: 'ATT-001', type: 'attachments', title: 'السجل التجاري', titleEn: 'Commercial Register', description: 'نسخة من السجل التجاري للشركة', status: 'approved', priority: 'medium', createdAt: '2026-03-01', attachments: ['commercial_register.pdf'] },
  { id: 'ATT-002', type: 'attachments', title: 'شهادة الضريبة', titleEn: 'Tax Certificate', description: 'شهادة التسجيل في ضريبة القيمة المضافة', status: 'approved', priority: 'medium', createdAt: '2026-03-01', attachments: ['vat_certificate.pdf'] },
  { id: 'ATT-003', type: 'attachments', title: 'تصميم الجناح', titleEn: 'Booth Design', description: 'ملف تصميم الجناح المعتمد', status: 'pending', priority: 'high', createdAt: '2026-03-10', attachments: ['booth_design_v2.pdf', 'booth_3d_render.jpg'] },
];

/* ─── Helpers ─── */
const statusConfig: Record<RequestStatus, { color: string; icon: typeof CheckCircle; bg: string }> = {
  pending: { color: 'text-amber-400', icon: Clock, bg: 'bg-amber-400/10 border-amber-400/20' },
  approved: { color: 'text-emerald-400', icon: CheckCircle, bg: 'bg-emerald-400/10 border-emerald-400/20' },
  rejected: { color: 'text-red-400', icon: XCircle, bg: 'bg-red-400/10 border-red-400/20' },
  active: { color: 'text-blue-400', icon: CheckCircle, bg: 'bg-blue-400/10 border-blue-400/20' },
  expired: { color: 'text-gray-400', icon: AlertTriangle, bg: 'bg-gray-400/10 border-gray-400/20' },
  inProgress: { color: 'text-cyan-400', icon: Loader2, bg: 'bg-cyan-400/10 border-cyan-400/20' },
  completed: { color: 'text-emerald-400', icon: CheckCircle, bg: 'bg-emerald-400/10 border-emerald-400/20' },
};

const priorityConfig: Record<Priority, { color: string; bg: string }> = {
  high: { color: 'text-red-400', bg: 'bg-red-400/10' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-400/10' },
  low: { color: 'text-blue-400', bg: 'bg-blue-400/10' },
};

/* ═══════════════════════════════════════════════════════════════ */
export default function Operations() {
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('permits');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OperationRequest | null>(null);

  // New form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPerson, setFormPerson] = useState('');
  const [formId, setFormId] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formVehicle, setFormVehicle] = useState('');
  const [formPriority, setFormPriority] = useState<Priority>('medium');
  const [formSubType, setFormSubType] = useState('');

  const tabs: { id: TabId; icon: typeof ShieldCheck; label: string; count: number }[] = [
    { id: 'permits', icon: ShieldCheck, label: t('ops.permits'), count: MOCK_PERMITS.length },
    { id: 'badges', icon: IdCard, label: t('ops.badges'), count: MOCK_BADGES.length },
    { id: 'furnishing', icon: Sofa, label: t('ops.furnishing'), count: MOCK_FURNISHING.length },
    { id: 'maintenance', icon: Wrench, label: t('ops.maintenance'), count: MOCK_MAINTENANCE.length },
    { id: 'supply', icon: Truck, label: t('ops.supply'), count: MOCK_SUPPLY.length },
    { id: 'approvals', icon: CheckSquare, label: t('ops.approvals'), count: MOCK_APPROVALS.length },
    { id: 'communications', icon: MessageSquare, label: t('ops.communications'), count: MOCK_COMMS.length },
    { id: 'attachments', icon: Paperclip, label: t('ops.attachments'), count: MOCK_ATTACHMENTS.length },
  ];

  const allData: Record<TabId, OperationRequest[]> = {
    permits: MOCK_PERMITS, badges: MOCK_BADGES, furnishing: MOCK_FURNISHING,
    maintenance: MOCK_MAINTENANCE, supply: MOCK_SUPPLY, approvals: MOCK_APPROVALS,
    communications: MOCK_COMMS, attachments: MOCK_ATTACHMENTS,
  };

  const filteredData = useMemo(() => {
    let data = allData[activeTab];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(r => r.title.toLowerCase().includes(q) || r.titleEn.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') data = data.filter(r => r.status === statusFilter);
    return data;
  }, [activeTab, searchQuery, statusFilter]);

  const handleSubmitForm = useCallback(() => {
    if (!formTitle.trim()) { toast.error(t('misc.please_enter_a_title')); return; }
    toast.success(t('reviews.request_submitted_it_will'));
    setShowNewForm(false);
    setFormTitle(''); setFormDesc(''); setFormPerson(''); setFormId(''); setFormPurpose(''); setFormVehicle(''); setFormSubType('');
  }, [formTitle, language]);

  const getSubTypes = (tab: TabId) => {
    if (tab === 'permits') return [
      { value: 'entry', label: t('ops.permitEntry') },
      { value: 'exit', label: t('ops.permitExit') },
      { value: 'supply', label: t('ops.permitSupply') },
      { value: 'maintenance', label: t('ops.permitMaintenance') },
    ];
    if (tab === 'badges') return [
      { value: 'employee', label: t('ops.badgeEmployee') },
      { value: 'contractor', label: t('ops.badgeContractor') },
      { value: 'visitor', label: t('ops.badgeVisitor') },
    ];
    return [];
  };

  const getNewLabel = () => {
    const map: Record<TabId, string> = {
      permits: t('ops.newPermit'), badges: t('ops.newBadge'),
      furnishing: t('operations.new_furnishing_request'),
      maintenance: t('ops.newMaintenance'), supply: t('ops.newSupply'),
      approvals: t('misc.new_approval_request'),
      communications: t('messages.new_message'),
      attachments: t('misc.upload_new_attachment'),
    };
    return map[activeTab];
  };

  return (
    <div className="page-enter space-y-4 sm:space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-xl sm:text-3xl font-bold text-foreground">
            {t('ops.title')}
          </h1>
          <p className="text-muted-foreground/80 text-sm mt-1">{t('ops.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          <Building2 className="w-4 h-4" />
          <span>{user?.company}</span>
          <span className="mx-1">|</span>
          <MapPin className="w-4 h-4" />
          <span>{t('expo.booth_a12')}</span>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery(''); setStatusFilter('all'); setShowNewForm(false); setSelectedRequest(null); }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 border ${
                isActive
                  ? 'border-[#d4a843]/25 text-[var(--gold-primary)]'
                  : 'bg-foreground/[0.02] border-border text-muted-foreground/80 hover:text-foreground/70 hover:bg-foreground/[0.03]'
              }`}>
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[var(--gold-primary)]/20 text-[var(--gold-primary)]' : 'bg-foreground/10 text-muted-foreground/80'}`}>
                {tab.count}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('search') + '...'}
              className="ps-9 h-10 bg-foreground/[0.04] border-white/[0.08] text-foreground placeholder:text-muted-foreground/40 rounded-xl text-sm" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-foreground/[0.04] border border-white/[0.08] text-foreground/80 rounded-xl text-sm appearance-none cursor-pointer">
            <option value="all" style={{ background: "var(--maham-card-bg)" }}>{t('ops.filterAll')}</option>
            <option value="pending" style={{ background: "var(--maham-card-bg)" }}>{t('ops.status.pending')}</option>
            <option value="approved" style={{ background: "var(--maham-card-bg)" }}>{t('ops.status.approved')}</option>
            <option value="rejected" style={{ background: "var(--maham-card-bg)" }}>{t('ops.status.rejected')}</option>
            <option value="active" style={{ background: "var(--maham-card-bg)" }}>{t('ops.status.active')}</option>
            <option value="inProgress" style={{ background: "var(--maham-card-bg)" }}>{t('ops.status.inProgress')}</option>
            <option value="completed" style={{ background: "var(--maham-card-bg)" }}>{t('ops.status.completed')}</option>
          </select>
        </div>
        <Button onClick={() => { setShowNewForm(true); setSelectedRequest(null); }}
          style={{ background: 'linear-gradient(135deg, #8B6914 0%, #d4a843 50%, #8B6914 100%)', color: 'var(--foreground)', boxShadow: 'var(--maham-btn-gold-shadow)' }}
          className="font-bold rounded-xl text-sm h-10 px-5">
          <Plus className="w-4 h-4 me-1.5" />{getNewLabel()}
        </Button>
      </motion.div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        {/* List */}
        <div className={`${selectedRequest || showNewForm ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-3`}>
          <AnimatePresence mode="popLayout">
            {filteredData.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-foreground/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground/60 text-sm">{t('ops.noRequests')}</p>
              </motion.div>
            ) : (
              filteredData.map((req, i) => {
                const sc = statusConfig[req.status];
                const pc = priorityConfig[req.priority];
                const StatusIcon = sc.icon;
                const isSelected = selectedRequest?.id === req.id;
                return (
                  <motion.div key={req.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.03 }} onClick={() => { setSelectedRequest(req); setShowNewForm(false); }}
                    className={`group p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'border-[#d4a843]/20'
                        : 'bg-foreground/[0.015] border-border hover:bg-foreground/[0.03] hover:border-border'
                    }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-muted-foreground/60 text-xs font-mono">{req.id}</span>
                          {req.subType && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground/80 border border-border">
                              {req.subType === 'entry' ? t('ops.permitEntry') : req.subType === 'exit' ? t('ops.permitExit') :
                               req.subType === 'supply' ? t('ops.permitSupply') : req.subType === 'maintenance' ? t('ops.permitMaintenance') :
                               req.subType === 'employee' ? t('ops.badgeEmployee') : req.subType === 'contractor' ? t('ops.badgeContractor') :
                               req.subType === 'visitor' ? t('ops.badgeVisitor') : req.subType}
                            </span>
                          )}
                        </div>
                        <h3 className="text-foreground text-sm font-medium truncate">{language === 'ar' ? req.title : req.titleEn}</h3>
                        <p className="text-muted-foreground/60 text-xs mt-1 line-clamp-1">{req.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-muted-foreground/40 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" />{req.createdAt}</span>
                          {req.personName && <span className="text-muted-foreground/40 text-xs flex items-center gap-1"><User className="w-3 h-3" />{req.personName}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs ${sc.bg}`}>
                          <StatusIcon className={`w-3 h-3 ${sc.color} ${req.status === 'inProgress' ? 'animate-spin' : ''}`} />
                          <span className={sc.color}>{t(`ops.status.${req.status}`)}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${pc.bg} ${pc.color}`}>{t(`ops.${req.priority}`)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Detail Panel / New Form */}
        <AnimatePresence mode="wait">
          {(selectedRequest || showNewForm) && (
            <motion.div key={showNewForm ? 'form' : selectedRequest?.id} initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
              className="lg:col-span-2 rounded-2xl bg-foreground/[0.03] border border-white/[0.08] backdrop-blur-sm overflow-hidden">

              {/* ── New Request Form ── */}
              {showNewForm && (
                <div className="p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-foreground">{getNewLabel()}</h3>
                    <button onClick={() => setShowNewForm(false)} className="p-1.5 rounded-lg hover:bg-foreground/10 text-muted-foreground/80 hover:text-foreground transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {getSubTypes(activeTab).length > 0 && (
                      <div>
                        <label className="text-muted-foreground text-xs font-medium block mb-1.5">{t('common.type')}</label>
                        <select value={formSubType} onChange={e => setFormSubType(e.target.value)}
                          className="w-full h-10 px-3 bg-foreground/[0.04] border border-white/[0.08] text-foreground rounded-xl text-sm appearance-none cursor-pointer">
                          <option value="" style={{ background: "var(--maham-card-bg)" }}>{t('map.select_type')}</option>
                          {getSubTypes(activeTab).map(st => <option key={st.value} value={st.value} style={{ background: "var(--maham-card-bg)" }}>{st.label}</option>)}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="text-muted-foreground text-xs font-medium block mb-1.5">{t('profile.address')} *</label>
                      <Input value={formTitle} onChange={e => setFormTitle(e.target.value)}
                        className="h-10 bg-foreground/[0.04] border-white/[0.08] text-foreground rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-muted-foreground text-xs font-medium block mb-1.5">{t('ops.description')}</label>
                      <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3}
                        className="w-full px-3 py-2 bg-foreground/[0.04] border border-white/[0.08] text-foreground rounded-xl text-sm resize-none focus:border-[#d4a843]/40 focus:outline-none" />
                    </div>
                    {(activeTab === 'permits' || activeTab === 'badges') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-muted-foreground text-xs font-medium block mb-1.5">{t('ops.personName')}</label>
                          <Input value={formPerson} onChange={e => setFormPerson(e.target.value)}
                            className="h-10 bg-foreground/[0.04] border-white/[0.08] text-foreground rounded-xl text-sm" />
                        </div>
                        <div>
                          <label className="text-muted-foreground text-xs font-medium block mb-1.5">{t('ops.idNumber')}</label>
                          <Input value={formId} onChange={e => setFormId(e.target.value)}
                            className="h-10 bg-foreground/[0.04] border-white/[0.08] text-foreground rounded-xl text-sm" />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-muted-foreground text-xs font-medium block mb-1.5">{t('ops.purpose')}</label>
                      <Input value={formPurpose} onChange={e => setFormPurpose(e.target.value)}
                        className="h-10 bg-foreground/[0.04] border-white/[0.08] text-foreground rounded-xl text-sm" />
                    </div>
                    {(activeTab === 'permits' || activeTab === 'supply') && (
                      <div>
                        <label className="text-muted-foreground text-xs font-medium block mb-1.5">{t('ops.vehiclePlate')}</label>
                        <Input value={formVehicle} onChange={e => setFormVehicle(e.target.value)}
                          className="h-10 bg-foreground/[0.04] border-white/[0.08] text-foreground rounded-xl text-sm" />
                      </div>
                    )}
                    <div>
                      <label className="text-muted-foreground text-xs font-medium block mb-1.5">{t('ops.priority')}</label>
                      <div className="flex gap-2">
                        {(['high', 'medium', 'low'] as Priority[]).map(p => (
                          <button key={p} onClick={() => setFormPriority(p)}
                            className={`flex-1 h-10 rounded-xl border text-sm font-medium transition-all duration-300 ${
                              formPriority === p ? `${priorityConfig[p].bg} ${priorityConfig[p].color} border-current` : 'bg-foreground/[0.03] border-border text-muted-foreground/80'
                            }`}>
                            {t(`ops.${p}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-muted-foreground text-xs font-medium block mb-1.5">{t('ops.attachFile')}</label>
                      <div className="border-2 border-dashed border-white/[0.08] rounded-xl p-6 text-center hover:border-[#d4a843]/30 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-muted-foreground/60 text-xs">{t('misc.drag_files_here_or')}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button onClick={handleSubmitForm}
                        style={{ background: 'linear-gradient(135deg, #8B6914 0%, #d4a843 50%, #8B6914 100%)', color: 'var(--foreground)', boxShadow: 'var(--maham-btn-gold-shadow)' }}
                        className="flex-1 font-bold rounded-xl h-11">
                        <Send className="w-4 h-4 me-1.5" />{t('ops.submit')}
                      </Button>
                      <Button onClick={() => setShowNewForm(false)} variant="outline"
                        className="rounded-xl h-11 border-border text-foreground/70 hover:bg-foreground/5">
                        {t('ops.cancel')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Request Detail ── */}
              {selectedRequest && !showNewForm && (
                <div className="p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground/60 text-sm font-mono">{selectedRequest.id}</span>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs ${statusConfig[selectedRequest.status].bg}`}>
                        {(() => { const SI = statusConfig[selectedRequest.status].icon; return <SI className={`w-3 h-3 ${statusConfig[selectedRequest.status].color}`} />; })()}
                        <span className={statusConfig[selectedRequest.status].color}>{t(`ops.status.${selectedRequest.status}`)}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedRequest(null)} className="p-1.5 rounded-lg hover:bg-foreground/10 text-muted-foreground/80 hover:text-foreground transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <h2 className="text-xl font-bold text-foreground mb-2">{language === 'ar' ? selectedRequest.title : selectedRequest.titleEn}</h2>
                  <p className="text-muted-foreground/80 text-sm mb-6">{selectedRequest.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {selectedRequest.personName && (
                      <div className="p-3 rounded-xl bg-foreground/[0.03] border border-border transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
                        <div className="flex items-center gap-2 text-muted-foreground/60 text-xs mb-1"><User className="w-3 h-3" />{t('ops.personName')}</div>
                        <p className="text-foreground text-sm">{selectedRequest.personName}</p>
                      </div>
                    )}
                    {selectedRequest.idNumber && (
                      <div className="p-3 rounded-xl bg-foreground/[0.03] border border-border transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
                        <div className="flex items-center gap-2 text-muted-foreground/60 text-xs mb-1"><Hash className="w-3 h-3" />{t('ops.idNumber')}</div>
                        <p className="text-foreground text-sm font-mono">{selectedRequest.idNumber}</p>
                      </div>
                    )}
                    {selectedRequest.purpose && (
                      <div className="p-3 rounded-xl bg-foreground/[0.03] border border-border transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
                        <div className="flex items-center gap-2 text-muted-foreground/60 text-xs mb-1"><FileText className="w-3 h-3" />{t('ops.purpose')}</div>
                        <p className="text-foreground text-sm">{selectedRequest.purpose}</p>
                      </div>
                    )}
                    {selectedRequest.vehiclePlate && (
                      <div className="p-3 rounded-xl bg-foreground/[0.03] border border-border transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
                        <div className="flex items-center gap-2 text-muted-foreground/60 text-xs mb-1"><Car className="w-3 h-3" />{t('ops.vehiclePlate')}</div>
                        <p className="text-foreground text-sm font-mono">{selectedRequest.vehiclePlate}</p>
                      </div>
                    )}
                    {selectedRequest.validFrom && (
                      <div className="p-3 rounded-xl bg-foreground/[0.03] border border-border transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
                        <div className="flex items-center gap-2 text-muted-foreground/60 text-xs mb-1"><Calendar className="w-3 h-3" />{t('ops.validFrom')}</div>
                        <p className="text-foreground text-sm">{selectedRequest.validFrom}</p>
                      </div>
                    )}
                    {selectedRequest.validTo && (
                      <div className="p-3 rounded-xl bg-foreground/[0.03] border border-border transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
                        <div className="flex items-center gap-2 text-muted-foreground/60 text-xs mb-1"><Calendar className="w-3 h-3" />{t('ops.validTo')}</div>
                        <p className="text-foreground text-sm">{selectedRequest.validTo}</p>
                      </div>
                    )}
                    <div className="p-3 rounded-xl bg-foreground/[0.03] border border-border transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
                      <div className="flex items-center gap-2 text-muted-foreground/60 text-xs mb-1"><Calendar className="w-3 h-3" />{t('ops.requestDate')}</div>
                      <p className="text-foreground text-sm">{selectedRequest.createdAt}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-foreground/[0.03] border border-border transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
                      <div className="flex items-center gap-2 text-muted-foreground/60 text-xs mb-1"><AlertTriangle className="w-3 h-3" />{t('ops.priority')}</div>
                      <span className={`text-sm ${priorityConfig[selectedRequest.priority].color}`}>{t(`ops.${selectedRequest.priority}`)}</span>
                    </div>
                  </div>

                  {selectedRequest.notes && (
                    <div className="p-4 rounded-xl bg-[var(--gold-primary)]/5 border border-[#d4a843]/10 mb-6 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
                      <p className="text-foreground/70 text-sm">{selectedRequest.notes}</p>
                    </div>
                  )}

                  {selectedRequest.boothId && (
                    <div className="p-3 rounded-xl bg-foreground/[0.03] border border-border mb-6 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-muted-foreground/60 text-xs">{t('map.booth')}</span>
                          <p className="text-foreground text-sm font-mono">{selectedRequest.boothId}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground/60 text-xs">{t('bookings.expo')}</span>
                          <p className="text-foreground text-sm">{selectedRequest.expoName}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-muted-foreground text-xs font-medium mb-2">{t('attachments')}</h4>
                      <div className="space-y-2">
                        {selectedRequest.attachments.map((att, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-foreground/[0.03] border border-border transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[var(--gold-primary)]/60" />
                              <span className="text-foreground/80 text-sm">{att}</span>
                            </div>
                            <button className="p-1.5 rounded-lg hover:bg-foreground/10 text-muted-foreground/60 hover:text-[var(--gold-primary)] transition-colors"
                              onClick={() => toast.info(t('common.loading'))}>
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    {selectedRequest.status === 'pending' && (
                      <Button onClick={() => toast.info(t('reviews.request_will_be_reviewed'))}
                        style={{ background: 'linear-gradient(135deg, #8B6914 0%, #d4a843 50%, #8B6914 100%)', color: 'var(--foreground)' }}
                      className="flex-1 font-bold rounded-xl h-10 text-sm">
                        <Eye className="w-4 h-4 me-1.5" />{t('common.track_request')}
                      </Button>
                    )}
                    {selectedRequest.status === 'approved' && (
                      <Button onClick={() => toast.success(t('operations.downloading_permit'))}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-400 text-foreground font-bold rounded-xl h-10 text-sm">
                        <Download className="w-4 h-4 me-1.5" />{t('operations.download_permit')}
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => toast.info(t('common.printing'))}
                      className="rounded-xl h-10 border-border text-foreground/70 hover:bg-foreground/5 text-sm">
                      {t('print')}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('ops.status.pending'), count: Object.values(allData).flat().filter(r => r.status === 'pending').length, color: 'amber' },
          { label: t('ops.status.approved'), count: Object.values(allData).flat().filter(r => r.status === 'approved').length, color: 'emerald' },
          { label: t('ops.status.inProgress'), count: Object.values(allData).flat().filter(r => r.status === 'inProgress').length, color: 'cyan' },
          { label: t('ops.status.completed'), count: Object.values(allData).flat().filter(r => r.status === 'completed').length, color: 'blue' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-xl bg-foreground/[0.02] border border-border transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
            <p className="text-muted-foreground/60 text-xs mb-1">{stat.label}</p>
            <p className={`text-lg sm:text-2xl font-bold text-${stat.color}-400`}>{stat.count}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
