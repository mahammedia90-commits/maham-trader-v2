/**
 * BookingFlow.tsx — نظام حجز الأجنحة المتكامل
 * ═══════════════════════════════════════════════
 * Design: Luxury Stepper Flow — mahamexpo.sa style
 * Colors: CSS Variables (--maham-*) for Dark/Light mode
 * 
 * Flow Steps:
 * 1. اختيار الوحدة/المساحة
 * 2. توثيق الحساب ورفع المستندات
 * 3. الشروط والأحكام وسياسة الموقع
 * 4. مراجعة المشرف والموافقة
 * 5. مسودة العقد والتوقيع الإلكتروني
 * 6. الدفع وبوابة الدفع
 * 7. التأكيد وإصدار الفاتورة والعقد
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Upload, FileText, Clock, PenTool, CreditCard, CheckCircle2,
  ChevronLeft, ChevronRight, Building2, Maximize2, DollarSign,
  Shield, AlertCircle, Download, Mail, Phone, MessageSquare,
  Eye, X, Check, Loader2, Star, ArrowLeft, Info,
  FileCheck, Lock, Send, Sparkles, Crown, BadgeCheck
} from 'lucide-react';

// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════
interface BoothOption {
  id: string;
  name: string;
  nameEn: string;
  zone: string;
  zoneEn: string;
  size: string;
  price: number;
  features: string[];
  featuresEn: string[];
  status: 'available' | 'reserved' | 'sold';
  image: string;
}

interface UploadedDoc {
  id: string;
  name: string;
  type: string;
  size: string;
  status: 'uploaded' | 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
}

// ═══════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════
const BOOTH_OPTIONS: BoothOption[] = [
  {
    id: 'B-101',
    name: 'جناح بريميوم A1',
    nameEn: 'Premium Booth A1',
    zone: 'المنطقة الذهبية',
    zoneEn: 'Golden Zone',
    size: '6×4 م',
    price: 45000,
    features: ['موقع مميز', 'إضاءة خاصة', 'كهرباء 220V', 'واي فاي مخصص'],
    featuresEn: ['Prime Location', 'Special Lighting', '220V Power', 'Dedicated WiFi'],
    status: 'available',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop'
  },
  {
    id: 'B-205',
    name: 'جناح ستاندرد B5',
    nameEn: 'Standard Booth B5',
    zone: 'المنطقة الفضية',
    zoneEn: 'Silver Zone',
    size: '4×3 م',
    price: 28000,
    features: ['موقع جيد', 'إضاءة عامة', 'كهرباء 220V'],
    featuresEn: ['Good Location', 'General Lighting', '220V Power'],
    status: 'available',
    image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=250&fit=crop'
  },
  {
    id: 'B-310',
    name: 'جناح VIP C10',
    nameEn: 'VIP Booth C10',
    zone: 'منطقة VIP',
    zoneEn: 'VIP Zone',
    size: '8×6 م',
    price: 75000,
    features: ['أفضل موقع', 'إضاءة فاخرة', 'كهرباء 380V', 'واي فاي مخصص', 'شاشة LED', 'غرفة اجتماعات'],
    featuresEn: ['Best Location', 'Luxury Lighting', '380V Power', 'Dedicated WiFi', 'LED Screen', 'Meeting Room'],
    status: 'available',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=250&fit=crop'
  }
];

const REQUIRED_DOCS = [
  { id: 'cr', nameAr: 'السجل التجاري', nameEn: 'Commercial Registration', icon: Building2 },
  { id: 'id', nameAr: 'الهوية الوطنية / الإقامة', nameEn: 'National ID / Iqama', icon: BadgeCheck },
  { id: 'license', nameAr: 'رخصة النشاط التجاري', nameEn: 'Business License', icon: FileCheck },
  { id: 'vat', nameAr: 'شهادة ضريبة القيمة المضافة', nameEn: 'VAT Certificate', icon: FileText },
];

// ═══════════════════════════════════════════════
// STEP DEFINITIONS
// ═══════════════════════════════════════════════
const STEPS = [
  { id: 1, icon: MapPin, labelAr: 'اختيار الوحدة', labelEn: 'Select Unit' },
  { id: 2, icon: Upload, labelAr: 'توثيق الحساب', labelEn: 'Verification' },
  { id: 3, icon: Shield, labelAr: 'الشروط والأحكام', labelEn: 'Terms & Conditions' },
  { id: 4, icon: Clock, labelAr: 'مراجعة المشرف', labelEn: 'Supervisor Review' },
  { id: 5, icon: PenTool, labelAr: 'توقيع العقد', labelEn: 'Sign Contract' },
  { id: 6, icon: CreditCard, labelAr: 'الدفع', labelEn: 'Payment' },
  { id: 7, icon: CheckCircle2, labelAr: 'التأكيد', labelEn: 'Confirmation' },
];

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════
export default function BookingFlow() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const isRTL = language === 'ar';
  const isAr = language === 'ar';

  // إذا الحساب موثّق → يبدأ من اختيار الوحدة (خطوة 1)
  // إذا غير موثّق → يبدأ من التوثيق (خطوة 2) بعد اختيار الوحدة
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBooth, setSelectedBooth] = useState<BoothOption | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDoc>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [supervisorStatus, setSupervisorStatus] = useState<'pending' | 'reviewing' | 'approved' | 'rejected'>('pending');
  const [signatureDrawn, setSignatureDrawn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [sendingConfirmation, setSendingConfirmation] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  // ═══════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1: return selectedBooth !== null;
      case 2: return Object.keys(uploadedDocs).length >= REQUIRED_DOCS.length;
      case 3: return termsAccepted && policyAccepted;
      case 4: return supervisorStatus === 'approved';
      case 5: return signatureDrawn;
      case 6: return paymentComplete;
      case 7: return true;
      default: return false;
    }
  }, [currentStep, selectedBooth, uploadedDocs, termsAccepted, policyAccepted, supervisorStatus, signatureDrawn, paymentComplete]);

  const nextStep = useCallback(() => {
    if (canProceed() && currentStep < 7) {
      setCurrentStep(prev => prev + 1);
    }
  }, [canProceed, currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // ═══════════════════════════════════════════════
  // DOCUMENT UPLOAD SIMULATION
  // ═══════════════════════════════════════════════
  const handleDocUpload = useCallback((docId: string, docName: string) => {
    setUploadedDocs(prev => ({
      ...prev,
      [docId]: {
        id: docId,
        name: docName,
        type: 'PDF',
        size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
        status: 'uploaded',
        uploadedAt: new Date().toLocaleString(t('common.enus')),
      }
    }));
  }, [isAr]);

  // ═══════════════════════════════════════════════
  // SUPERVISOR REVIEW SIMULATION
  // ═══════════════════════════════════════════════
  const simulateSupervisorReview = useCallback(() => {
    setSupervisorStatus('reviewing');
    setTimeout(() => {
      setSupervisorStatus('approved');
    }, 3000);
  }, []);

  useEffect(() => {
    if (currentStep === 4 && supervisorStatus === 'pending') {
      simulateSupervisorReview();
    }
  }, [currentStep, supervisorStatus, simulateSupervisorReview]);

  // ═══════════════════════════════════════════════
  // SIGNATURE CANVAS
  // ═══════════════════════════════════════════════
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = '#d4a843';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    if (currentStep === 5) {
      setTimeout(initCanvas, 100);
    }
  }, [currentStep, initCanvas]);

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getCanvasPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setSignatureDrawn(true);
  };

  const stopDraw = () => {
    isDrawing.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDrawn(false);
  };

  // ═══════════════════════════════════════════════
  // PAYMENT SIMULATION
  // ═══════════════════════════════════════════════
  const processPayment = useCallback(() => {
    if (!paymentMethod) return;
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentComplete(true);
    }, 2500);
  }, [paymentMethod]);

  // ═══════════════════════════════════════════════
  // CONFIRMATION SEND
  // ═══════════════════════════════════════════════
  const sendConfirmation = useCallback(() => {
    setSendingConfirmation(true);
    setTimeout(() => {
      setSendingConfirmation(false);
      setConfirmationSent(true);
    }, 2000);
  }, []);

  useEffect(() => {
    if (currentStep === 7 && !confirmationSent && !sendingConfirmation) {
      sendConfirmation();
    }
  }, [currentStep, confirmationSent, sendingConfirmation, sendConfirmation]);

  // ═══════════════════════════════════════════════
  // STEPPER UI
  // ═══════════════════════════════════════════════
  const renderStepper = () => (
    <div className="w-full mb-6 sm:mb-8">
      {/* Desktop Stepper */}
      <div className="hidden lg:flex items-center justify-between relative px-4">
        {/* Connection Line */}
        <div className="absolute top-5 left-8 right-8 h-[2px]" style={{ background: 'var(--maham-divider)' }} />
        <div
          className="absolute top-5 h-[2px] transition-all duration-700 ease-out"
          style={{
            background: 'var(--maham-gold)',
            left: '2rem',
            width: `${((currentStep - 1) / (STEPS.length - 1)) * (100 - 8)}%`,
            boxShadow: '0 0 8px rgba(212, 168, 67, 0.4)'
          }}
        />
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500"
                style={{
                  background: isCompleted
                    ? 'var(--maham-gold)'
                    : isActive
                      ? 'var(--maham-card-bg)'
                      : 'var(--maham-card-bg)',
                  border: isActive
                    ? '2px solid var(--maham-gold)'
                    : isCompleted
                      ? 'none'
                      : '2px solid var(--maham-divider)',
                  boxShadow: isActive
                    ? '0 0 15px rgba(212, 168, 67, 0.3)'
                    : isCompleted
                      ? '0 0 10px rgba(212, 168, 67, 0.2)'
                      : 'none',
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" style={{ color: 'var(--maham-btn-gold-text)' }} />
                ) : (
                  <Icon
                    className="w-4 h-4"
                    style={{ color: isActive ? 'var(--maham-gold)' : 'var(--maham-text-muted)' }}
                  />
                )}
              </div>
              <span
                className="text-[11px] font-semibold whitespace-nowrap"
                style={{
                  color: isActive ? 'var(--maham-gold)' : isCompleted ? 'var(--maham-text-secondary)' : 'var(--maham-text-muted)'
                }}
              >
                {isAr ? step.labelAr : step.labelEn}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper — Compact */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-sm font-bold" style={{ color: 'var(--maham-gold)' }}>
            {isAr ? `الخطوة ${currentStep}` : `Step ${currentStep}`} / {STEPS.length}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--maham-text-secondary)' }}>
            {isAr ? STEPS[currentStep - 1].labelAr : STEPS[currentStep - 1].labelEn}
          </span>
        </div>
        <div className="flex gap-1">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className="h-1.5 rounded-full flex-1 transition-all duration-500"
              style={{
                background: step.id < currentStep
                  ? 'var(--maham-gold)'
                  : step.id === currentStep
                    ? 'var(--maham-gold)'
                    : 'var(--maham-divider)',
                opacity: step.id <= currentStep ? 1 : 0.4,
                boxShadow: step.id === currentStep ? '0 0 6px rgba(212, 168, 67, 0.4)' : 'none'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════
  // STEP 1: SELECT UNIT
  // ═══════════════════════════════════════════════
  const renderStep1 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--maham-text-primary)' }}>
          {t('booking_flow.select_your_unit_or')}
        </h2>
        <p className="text-sm" style={{ color: 'var(--maham-text-muted)' }}>
          {t('booking_flow.choose_the_booth_that')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {BOOTH_OPTIONS.map((booth) => {
          const isSelected = selectedBooth?.id === booth.id;
          return (
            <div
              key={booth.id}
              onClick={() => setSelectedBooth(booth)}
              onTouchEnd={(e) => { e.preventDefault(); setSelectedBooth(booth); }}
              className="glass-card cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-0.5 will-change-transform"
              style={{
                borderColor: isSelected ? 'var(--maham-gold)' : undefined,
                boxShadow: isSelected ? 'var(--gold-glow-hover)' : undefined,
                transform: isSelected ? 'scale(1.02)' : undefined,
              }}
            >
              {/* Image */}
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <img src={booth.image} alt={isAr ? booth.name : booth.nameEn} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                {isSelected && (
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--maham-gold)' }}>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#0A0A0A' }} />
                  </div>
                )}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--maham-gold)', color: '#0A0A0A' }}>
                  {booth.id}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-bold mb-1" style={{ color: 'var(--maham-text-primary)' }}>
                  {isAr ? booth.name : booth.nameEn}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--maham-gold)' }} />
                  <span className="text-xs" style={{ color: 'var(--maham-text-muted)' }}>
                    {isAr ? booth.zone : booth.zoneEn}
                  </span>
                  <span className="mx-1" style={{ color: 'var(--maham-divider)' }}>|</span>
                  <Maximize2 className="w-3.5 h-3.5" style={{ color: 'var(--maham-text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--maham-text-muted)' }}>{booth.size}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(isAr ? booth.features : booth.featuresEn).slice(0, 3).map((f, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium" style={{ background: 'var(--maham-gold-bg)', color: 'var(--maham-gold)', border: '1px solid var(--maham-gold-border)' }}>
                      {f}
                    </span>
                  ))}
                  {(isAr ? booth.features : booth.featuresEn).length > 3 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px]" style={{ color: 'var(--maham-text-muted)' }}>
                      +{(isAr ? booth.features : booth.featuresEn).length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--maham-divider)' }}>
                  <div>
                    <span className="text-xs" style={{ color: 'var(--maham-text-muted)' }}>
                      {t('map.price')}
                    </span>
                    <div className="text-lg sm:text-xl font-bold" style={{ color: 'var(--maham-gold)' }}>
                      {booth.price.toLocaleString()} <span className="text-xs font-normal" style={{ color: 'var(--maham-text-muted)' }}>{t('sar')}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'var(--maham-gold)', color: 'var(--maham-btn-gold-text)' }}>
                      {t('common.selected')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════
  // STEP 2: ACCOUNT VERIFICATION & DOCUMENTS
  // ═══════════════════════════════════════════════
  const renderStep2 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--maham-text-primary)' }}>
          {t('booking_flow.account_verification_documents')}
        </h2>
        <p className="text-sm" style={{ color: 'var(--maham-text-muted)' }}>
          {t('booking_flow.please_upload_the_required')}
        </p>
      </div>

      {/* Info Banner */}
      <div className="glass-card p-4 mb-6 flex items-start gap-3 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform" style={{ borderColor: 'var(--maham-gold-border)', background: 'var(--maham-gold-bg)' }}>
        <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--maham-gold)' }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--maham-gold)' }}>
            {t('booking_flow.important_all_documents_are')}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--maham-text-muted)' }}>
            {t('booking_flow.all_documents_must_be')}
          </p>
        </div>
      </div>

      {/* Document Upload Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REQUIRED_DOCS.map((doc) => {
          const uploaded = uploadedDocs[doc.id];
          const Icon = doc.icon;
          return (
            <div key={doc.id} className="glass-card p-4 sm:p-5 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--maham-gold-bg)', border: '1px solid var(--maham-gold-border)' }}>
                    <Icon className="w-5 h-5" style={{ color: 'var(--maham-gold)' }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--maham-text-primary)' }}>
                      {isAr ? doc.nameAr : doc.nameEn}
                    </h4>
                    <span className="text-[11px]" style={{ color: 'var(--maham-text-muted)' }}>
                      PDF, JPG, PNG — {t('booking_flow.max_10_mb')}
                    </span>
                  </div>
                </div>
                {uploaded && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--maham-gold)' }}>
                    <Check className="w-3.5 h-3.5" style={{ color: 'var(--maham-btn-gold-text)' }} />
                  </div>
                )}
              </div>

              {uploaded ? (
                <div className="p-3 rounded-lg flex items-center justify-between" style={{ background: 'var(--maham-gold-bg)', border: '1px solid var(--maham-gold-border)' }}>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: 'var(--maham-gold)' }} />
                    <div>
                      <span className="text-xs font-semibold block" style={{ color: 'var(--maham-text-primary)' }}>
                        {isAr ? doc.nameAr : doc.nameEn}.pdf
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--maham-text-muted)' }}>{uploaded.size}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--maham-gold)', color: 'var(--maham-btn-gold-text)' }}>
                    {t('booking_flow.uploaded')}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => handleDocUpload(doc.id, isAr ? doc.nameAr : doc.nameEn)}
                  onTouchEnd={(e) => { e.preventDefault(); handleDocUpload(doc.id, isAr ? doc.nameAr : doc.nameEn); }}
                  className="w-full p-4 rounded-lg border-2 border-dashed flex flex-col items-center gap-2 transition-all duration-300 hover:border-[var(--maham-gold)] active:scale-[0.98]"
                  style={{ borderColor: 'var(--maham-divider)', background: 'transparent' }}
                >
                  <Upload className="w-6 h-6" style={{ color: 'var(--maham-text-muted)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--maham-text-muted)' }}>
                    {t('booking_flow.click_to_upload_file')}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Progress */}
      <div className="mt-5 flex items-center justify-between px-1">
        <span className="text-sm" style={{ color: 'var(--maham-text-muted)' }}>
          {t('booking_flow.documents_uploaded')}
        </span>
        <span className="text-sm font-bold" style={{ color: Object.keys(uploadedDocs).length >= REQUIRED_DOCS.length ? 'var(--maham-gold)' : 'var(--maham-text-muted)' }}>
          {Object.keys(uploadedDocs).length} / {REQUIRED_DOCS.length}
        </span>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════
  // STEP 3: TERMS & CONDITIONS
  // ═══════════════════════════════════════════════
  const renderStep3 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--maham-text-primary)' }}>
          {t('booking_flow.terms_conditions_site_policy')}
        </h2>
        <p className="text-sm" style={{ color: 'var(--maham-text-muted)' }}>
          {t('booking_flow.please_read_the_terms')}
        </p>
      </div>

      {/* Terms Document */}
      <div className="glass-card p-5 sm:p-6 mb-5 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--maham-gold-bg)', border: '1px solid var(--maham-gold-border)' }}>
            <Shield className="w-5 h-5" style={{ color: 'var(--maham-gold)' }} />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--maham-text-primary)' }}>
              {t('booking_flow.booking_terms_conditions')}
            </h3>
            <span className="text-xs" style={{ color: 'var(--maham-text-muted)' }}>
              {t('booking_flow.last_updated_march_2026')}
            </span>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto p-4 rounded-lg text-sm leading-7" style={{ background: 'var(--maham-input-bg)', border: '1px solid var(--maham-divider)', color: 'var(--maham-text-secondary)' }}>
          {isAr ? (
            <>
              <p className="font-bold mb-3" style={{ color: 'var(--maham-text-primary)' }}>المادة الأولى: التعريفات</p>
              <p className="mb-3">يُقصد بـ "المنصة" موقع مهام إكسبو الإلكتروني وتطبيقاته. ويُقصد بـ "التاجر" أو "العارض" كل شخص طبيعي أو اعتباري يقوم بحجز مساحة عرض من خلال المنصة.</p>
              <p className="font-bold mb-3" style={{ color: 'var(--maham-text-primary)' }}>المادة الثانية: شروط الحجز</p>
              <p className="mb-3">1. يجب على التاجر تقديم جميع المستندات المطلوبة (السجل التجاري، الهوية الوطنية/الإقامة، رخصة النشاط التجاري، شهادة ضريبة القيمة المضافة) قبل إتمام الحجز.</p>
              <p className="mb-3">2. لا يُعتبر الحجز مؤكداً إلا بعد موافقة المشرف وإتمام عملية الدفع كاملة.</p>
              <p className="mb-3">3. يحق لإدارة المعرض رفض أي طلب حجز دون إبداء الأسباب.</p>
              <p className="font-bold mb-3" style={{ color: 'var(--maham-text-primary)' }}>المادة الثالثة: الدفع والإلغاء</p>
              <p className="mb-3">1. يجب سداد كامل المبلغ خلال 48 ساعة من الموافقة على الحجز.</p>
              <p className="mb-3">2. في حال الإلغاء قبل 30 يوماً من المعرض، يتم استرداد 70% من المبلغ.</p>
              <p className="mb-3">3. في حال الإلغاء قبل 15 يوماً، يتم استرداد 30% فقط.</p>
              <p className="mb-3">4. لا يتم أي استرداد في حال الإلغاء قبل أقل من 15 يوماً.</p>
              <p className="font-bold mb-3" style={{ color: 'var(--maham-text-primary)' }}>المادة الرابعة: التزامات التاجر</p>
              <p className="mb-3">1. الالتزام بأنظمة وقوانين المملكة العربية السعودية.</p>
              <p className="mb-3">2. الحفاظ على نظافة المساحة المخصصة.</p>
              <p className="mb-3">3. عدم عرض أي منتجات مخالفة أو محظورة.</p>
              <p className="mb-3">4. الالتزام بمواعيد التجهيز والإخلاء المحددة من الإدارة.</p>
            </>
          ) : (
            <>
              <p className="font-bold mb-3" style={{ color: 'var(--maham-text-primary)' }}>Article 1: Definitions</p>
              <p className="mb-3">"Platform" refers to the Maham Expo website and its applications. "Merchant" or "Exhibitor" refers to any natural or legal person who books exhibition space through the Platform.</p>
              <p className="font-bold mb-3" style={{ color: 'var(--maham-text-primary)' }}>Article 2: Booking Conditions</p>
              <p className="mb-3">1. The merchant must submit all required documents (Commercial Registration, National ID/Iqama, Business License, VAT Certificate) before completing the booking.</p>
              <p className="mb-3">2. A booking is not considered confirmed until the supervisor approves it and full payment is completed.</p>
              <p className="mb-3">3. The exhibition management reserves the right to reject any booking request without stating reasons.</p>
              <p className="font-bold mb-3" style={{ color: 'var(--maham-text-primary)' }}>Article 3: Payment & Cancellation</p>
              <p className="mb-3">1. Full payment must be made within 48 hours of booking approval.</p>
              <p className="mb-3">2. Cancellation 30+ days before: 70% refund. 15-30 days: 30% refund. Less than 15 days: No refund.</p>
              <p className="font-bold mb-3" style={{ color: 'var(--maham-text-primary)' }}>Article 4: Merchant Obligations</p>
              <p className="mb-3">1. Comply with Saudi Arabian laws and regulations.</p>
              <p className="mb-3">2. Maintain cleanliness of allocated space.</p>
              <p className="mb-3">3. No prohibited or illegal products.</p>
              <p className="mb-3">4. Adhere to setup and evacuation schedules.</p>
            </>
          )}
        </div>
      </div>

      {/* Acceptance Checkboxes */}
      <div className="space-y-4">
        <label
          className="glass-card p-4 flex items-start gap-3 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 will-change-transform"
          style={{ borderColor: termsAccepted ? 'var(--maham-gold)' : undefined }}
        >
          <div
            onClick={() => setTermsAccepted(!termsAccepted)}
            onTouchEnd={(e) => { e.preventDefault(); setTermsAccepted(!termsAccepted); }}
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300"
            style={{
              background: termsAccepted ? 'var(--maham-gold)' : 'transparent',
              border: termsAccepted ? 'none' : '2px solid var(--maham-divider)',
            }}
          >
            {termsAccepted && <Check className="w-4 h-4" style={{ color: 'var(--maham-btn-gold-text)' }} />}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--maham-text-primary)' }}>
              {t('booking_flow.i_agree_to_the')}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--maham-text-muted)' }}>
              {t('booking_flow.by_agreeing_i_confirm')}
            </p>
          </div>
        </label>

        <label
          className="glass-card p-4 flex items-start gap-3 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 will-change-transform"
          style={{ borderColor: policyAccepted ? 'var(--maham-gold)' : undefined }}
        >
          <div
            onClick={() => setPolicyAccepted(!policyAccepted)}
            onTouchEnd={(e) => { e.preventDefault(); setPolicyAccepted(!policyAccepted); }}
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300"
            style={{
              background: policyAccepted ? 'var(--maham-gold)' : 'transparent',
              border: policyAccepted ? 'none' : '2px solid var(--maham-divider)',
            }}
          >
            {policyAccepted && <Check className="w-4 h-4" style={{ color: 'var(--maham-btn-gold-text)' }} />}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--maham-text-primary)' }}>
              {t('booking_flow.i_agree_to_the_2')}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--maham-text-muted)' }}>
              {t('booking_flow.i_consent_to_the')}
            </p>
          </div>
        </label>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════
  // STEP 4: SUPERVISOR REVIEW
  // ═══════════════════════════════════════════════
  const renderStep4 = () => (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
      <div className="text-center max-w-md mx-auto">
        {supervisorStatus === 'reviewing' && (
          <>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-6 flex items-center justify-center relative" style={{ background: 'var(--maham-gold-bg)', border: '2px solid var(--maham-gold-border)' }}>
              <Clock className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: 'var(--maham-gold)' }} />
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'var(--maham-gold)' }} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: 'var(--maham-text-primary)' }}>
              {t('booking_flow.reviewing_your_request')}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--maham-text-muted)' }}>
              {t('booking_flow.the_supervisor_is_currently')}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--maham-gold)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--maham-gold)' }}>
                {t('booking_flow.under_review')}
              </span>
            </div>
          </>
        )}

        {supervisorStatus === 'approved' && (
          <>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'var(--maham-gold)', boxShadow: '0 0 30px rgba(212, 168, 67, 0.3)' }}>
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: 'var(--maham-btn-gold-text)' }} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: 'var(--maham-text-primary)' }}>
              {t('booking_flow.your_request_is_approved')}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--maham-text-muted)' }}>
              {t('booking_flow.your_documents_have_been')}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'var(--maham-gold-bg)', border: '1px solid var(--maham-gold-border)' }}>
              <BadgeCheck className="w-5 h-5" style={{ color: 'var(--maham-gold)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--maham-gold)' }}>
                {t('booking_flow.verified_approved')}
              </span>
            </div>
          </>
        )}

        {supervisorStatus === 'pending' && (
          <>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'var(--maham-gold-bg)', border: '2px solid var(--maham-gold-border)' }}>
              <Clock className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: 'var(--maham-text-muted)' }} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: 'var(--maham-text-primary)' }}>
              {t('booking_flow.awaiting_review')}
            </h2>
            <p className="text-sm" style={{ color: 'var(--maham-text-muted)' }}>
              {t('booking_flow.your_request_will_be')}
            </p>
          </>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════
  // STEP 5: CONTRACT DRAFT & SIGNATURE
  // ═══════════════════════════════════════════════
  const renderStep5 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--maham-text-primary)' }}>
          {t('booking_flow.contract_draft_electronic_signature')}
        </h2>
        <p className="text-sm" style={{ color: 'var(--maham-text-muted)' }}>
          {t('booking_flow.review_the_contract_details')}
        </p>
      </div>

      {/* Contract Preview */}
      <div className="glass-card-elevated p-5 sm:p-6 mb-5 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6" style={{ color: 'var(--maham-gold)' }} />
            <h3 className="text-base font-bold" style={{ color: 'var(--maham-text-primary)' }}>
              {t('booking_flow.exhibition_space_booking_contract')}
            </h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: 'var(--maham-gold-bg)', color: 'var(--maham-gold)', border: '1px solid var(--maham-gold-border)' }}>
            {t('contract_status.draft')}
          </span>
        </div>

        <div className="space-y-3 text-sm" style={{ color: 'var(--maham-text-secondary)' }}>
          <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--maham-divider)' }}>
            <span style={{ color: 'var(--maham-text-muted)' }}>{t('booking_flow.contract_no_2')}</span>
            <span className="font-bold" style={{ color: 'var(--maham-gold)' }}>MHM-2026-{selectedBooth?.id || 'XXX'}</span>
          </div>
          <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--maham-divider)' }}>
            <span style={{ color: 'var(--maham-text-muted)' }}>{t('map.booth')}</span>
            <span className="font-semibold" style={{ color: 'var(--maham-text-primary)' }}>{selectedBooth ? (isAr ? selectedBooth.name : selectedBooth.nameEn) : '—'}</span>
          </div>
          <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--maham-divider)' }}>
            <span style={{ color: 'var(--maham-text-muted)' }}>{t('map.zone')}</span>
            <span className="font-semibold" style={{ color: 'var(--maham-text-primary)' }}>{selectedBooth ? (isAr ? selectedBooth.zone : selectedBooth.zoneEn) : '—'}</span>
          </div>
          <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--maham-divider)' }}>
            <span style={{ color: 'var(--maham-text-muted)' }}>{t('map.area')}</span>
            <span className="font-semibold" style={{ color: 'var(--maham-text-primary)' }}>{selectedBooth?.size || '—'}</span>
          </div>
          <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--maham-divider)' }}>
            <span style={{ color: 'var(--maham-text-muted)' }}>{t('booking_flow.total_amount')}</span>
            <span className="font-bold text-base" style={{ color: 'var(--maham-gold)' }}>
              {selectedBooth?.price.toLocaleString() || '—'} {t('sar')}
            </span>
          </div>
          <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--maham-divider)' }}>
            <span style={{ color: 'var(--maham-text-muted)' }}>{t('booking_flow.including_vat')}</span>
            <span className="font-semibold" style={{ color: 'var(--maham-text-primary)' }}>15%</span>
          </div>
          <div className="flex justify-between py-2">
            <span style={{ color: 'var(--maham-text-muted)' }}>{t('booking_flow.contract_date')}</span>
            <span className="font-semibold" style={{ color: 'var(--maham-text-primary)' }}>{new Date().toLocaleDateString(t('common.enus'))}</span>
          </div>
        </div>
      </div>

      {/* Signature Pad */}
      <div className="glass-card p-5 sm:p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5" style={{ color: 'var(--maham-gold)' }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--maham-text-primary)' }}>
              {t('booking_flow.electronic_signature')}
            </h3>
          </div>
          {signatureDrawn && (
            <button
              onClick={clearSignature}
              onTouchEnd={(e) => { e.preventDefault(); clearSignature(); }}
              className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
              style={{ color: 'var(--maham-text-muted)', background: 'var(--maham-input-bg)' }}
            >
              {t('booking_flow.clear')}
            </button>
          )}
        </div>
        <div className="relative rounded-xl overflow-hidden" style={{ border: '2px dashed var(--maham-gold-border)', background: 'var(--maham-input-bg)' }}>
          <canvas
            ref={canvasRef}
            className="w-full touch-none"
            style={{ height: '160px', cursor: 'crosshair' }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          {!signatureDrawn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-sm" style={{ color: 'var(--maham-text-muted)' }}>
                {t('booking_flow.draw_your_signature_here')}
              </span>
            </div>
          )}
        </div>
        <p className="text-[11px] mt-3" style={{ color: 'var(--maham-text-muted)' }}>
          {t('booking_flow.by_signing_you_agree')}
        </p>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════
  // STEP 6: PAYMENT
  // ═══════════════════════════════════════════════
  const renderStep6 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: 'var(--maham-text-primary)' }}>
          {t('booking_flow.complete_payment')}
        </h2>
        <p className="text-sm" style={{ color: 'var(--maham-text-muted)' }}>
          {t('booking_flow.choose_your_preferred_payment')}
        </p>
      </div>

      {/* Order Summary */}
      <div className="glass-card-elevated p-5 sm:p-6 mb-5 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
        <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--maham-text-primary)' }}>
          {t('booking_flow.order_summary')}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: 'var(--maham-text-muted)' }}>{selectedBooth ? (isAr ? selectedBooth.name : selectedBooth.nameEn) : '—'}</span>
            <span style={{ color: 'var(--maham-text-primary)' }}>{selectedBooth?.price.toLocaleString()} {t('sar')}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--maham-text-muted)' }}>{t('common.vat_15')}</span>
            <span style={{ color: 'var(--maham-text-primary)' }}>{selectedBooth ? (selectedBooth.price * 0.15).toLocaleString() : '—'} {t('sar')}</span>
          </div>
          <div className="flex justify-between pt-3 mt-2" style={{ borderTop: '2px solid var(--maham-gold-border)' }}>
            <span className="font-bold" style={{ color: 'var(--maham-text-primary)' }}>{t('common.total')}</span>
            <span className="font-bold text-lg" style={{ color: 'var(--maham-gold)' }}>
              {selectedBooth ? (selectedBooth.price * 1.15).toLocaleString() : '—'} {t('sar')}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      {!paymentComplete ? (
        <div className="space-y-3 mb-5">
          <h3 className="text-sm font-bold" style={{ color: 'var(--maham-text-primary)' }}>
            {t('booking_flow.select_payment_method')}
          </h3>
          {[
            { id: 'mada', nameAr: 'مدى', nameEn: 'Mada', icon: '🏦' },
            { id: 'visa', nameAr: 'فيزا / ماستركارد', nameEn: 'Visa / Mastercard', icon: '💳' },
            { id: 'apple', nameAr: 'Apple Pay', nameEn: 'Apple Pay', icon: '' },
            { id: 'transfer', nameAr: 'تحويل بنكي', nameEn: 'Bank Transfer', icon: '🏛️' },
          ].map((method) => (
            <div
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              onTouchEnd={(e) => { e.preventDefault(); setPaymentMethod(method.id); }}
              className="glass-card p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 will-change-transform"
              style={{
                borderColor: paymentMethod === method.id ? 'var(--maham-gold)' : undefined,
                boxShadow: paymentMethod === method.id ? '0 0 15px rgba(212, 168, 67, 0.15)' : undefined,
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'var(--maham-gold-bg)', border: '1px solid var(--maham-gold-border)' }}>
                {method.icon}
              </div>
              <span className="text-sm font-semibold flex-1" style={{ color: 'var(--maham-text-primary)' }}>
                {isAr ? method.nameAr : method.nameEn}
              </span>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  border: paymentMethod === method.id ? 'none' : '2px solid var(--maham-divider)',
                  background: paymentMethod === method.id ? 'var(--maham-gold)' : 'transparent',
                }}
              >
                {paymentMethod === method.id && <Check className="w-3 h-3" style={{ color: 'var(--maham-btn-gold-text)' }} />}
              </div>
            </div>
          ))}

          {paymentMethod && (
            <button
              onClick={processPayment}
              onTouchEnd={(e) => { e.preventDefault(); processPayment(); }}
              disabled={paymentProcessing}
              className="btn-gold w-full py-4 text-base font-bold rounded-xl flex items-center justify-center gap-2 mt-4 min-h-[52px] transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform"
            >
              {paymentProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('booking_flow.processing_payment')}</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>{isAr ? `ادفع ${selectedBooth ? (selectedBooth.price * 1.15).toLocaleString() : ''} ر.س` : `Pay ${selectedBooth ? (selectedBooth.price * 1.15).toLocaleString() : ''} SAR`}</span>
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card p-6 text-center transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--maham-gold)', boxShadow: '0 0 25px rgba(212, 168, 67, 0.3)' }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--maham-btn-gold-text)' }} />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--maham-text-primary)' }}>
            {t('booking_flow.payment_successful')}
          </h3>
          <p className="text-sm" style={{ color: 'var(--maham-text-muted)' }}>
            {t('booking_flow.amount_has_been_charged')}
          </p>
        </div>
      )}

      {/* Security Note */}
      <div className="flex items-center gap-2 mt-4 px-1">
        <Lock className="w-4 h-4" style={{ color: 'var(--maham-text-muted)' }} />
        <span className="text-[11px]" style={{ color: 'var(--maham-text-muted)' }}>
          {t('booking_flow.all_transactions_are_encrypted')}
        </span>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════
  // STEP 7: CONFIRMATION
  // ═══════════════════════════════════════════════
  const renderStep7 = () => (
    <div className="flex flex-col items-center justify-center py-6 sm:py-10">
      <div className="text-center max-w-lg mx-auto">
        {/* Success Animation */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full animate-ping opacity-10" style={{ background: 'var(--maham-gold)' }} />
          <div className="relative w-full h-full rounded-full flex items-center justify-center" style={{ background: 'var(--maham-gold)', boxShadow: '0 0 40px rgba(212, 168, 67, 0.3)' }}>
            <Sparkles className="w-12 h-12 sm:w-14 sm:h-14" style={{ color: 'var(--maham-btn-gold-text)' }} />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'var(--maham-text-primary)' }}>
          {t('booking_flow.booking_confirmed_successfully')}
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--maham-text-muted)' }}>
          {t('booking_flow.congratulations_contract_and_invoice')}
        </p>

        {/* Booking Details Card */}
        <div className="glass-card-elevated p-5 sm:p-6 mb-6 text-right transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6" style={{ color: 'var(--maham-gold)' }} />
            <h3 className="text-base font-bold" style={{ color: 'var(--maham-text-primary)' }}>
              {t('booking_flow.booking_details')}
            </h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5">
              <span style={{ color: 'var(--maham-text-muted)' }}>{t('booking_flow.booking_no')}</span>
              <span className="font-bold" style={{ color: 'var(--maham-gold)' }}>BK-2026-{Math.floor(Math.random() * 9000 + 1000)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span style={{ color: 'var(--maham-text-muted)' }}>{t('booking_flow.contract_no_2')}</span>
              <span className="font-semibold" style={{ color: 'var(--maham-text-primary)' }}>MHM-2026-{selectedBooth?.id || 'XXX'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span style={{ color: 'var(--maham-text-muted)' }}>{t('map.booth')}</span>
              <span className="font-semibold" style={{ color: 'var(--maham-text-primary)' }}>{selectedBooth ? (isAr ? selectedBooth.name : selectedBooth.nameEn) : '—'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span style={{ color: 'var(--maham-text-muted)' }}>{t('booking_flow.amount_paid')}</span>
              <span className="font-bold" style={{ color: 'var(--maham-gold)' }}>{selectedBooth ? (selectedBooth.price * 1.15).toLocaleString() : '—'} {t('sar')}</span>
            </div>
          </div>
        </div>

        {/* Sending Status */}
        <div className="glass-card p-5 mb-6 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
          <h4 className="text-sm font-bold mb-4" style={{ color: 'var(--maham-text-primary)' }}>
            {t('booking_flow.sending_contract_invoice_copy')}
          </h4>
          <div className="space-y-3">
            {[
              { icon: Mail, labelAr: 'البريد الإلكتروني', labelEn: 'Email', detail: 'trader@example.com' },
              { icon: Phone, labelAr: 'رسالة SMS', labelEn: 'SMS', detail: '+966 5XX XXX XXX' },
              { icon: MessageSquare, labelAr: 'واتساب', labelEn: 'WhatsApp', detail: '+966 5XX XXX XXX' },
            ].map((channel, i) => {
              const Icon = channel.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--maham-gold-bg)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--maham-gold)', boxShadow: '0 0 8px rgba(212, 168, 67, 0.2)' }}>
                    <Icon className="w-4 h-4" style={{ color: 'var(--maham-btn-gold-text)' }} />
                  </div>
                  <div className="flex-1 text-right" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                    <span className="text-xs font-semibold block" style={{ color: 'var(--maham-text-primary)' }}>
                      {isAr ? channel.labelAr : channel.labelEn}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--maham-text-muted)' }}>{channel.detail}</span>
                  </div>
                  {confirmationSent ? (
                    <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--maham-gold)' }} />
                  ) : (
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--maham-gold)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="btn-gold flex-1 py-3 flex items-center justify-center gap-2 min-h-[48px]">
            <Download className="w-5 h-5" />
            <span className="text-sm font-bold">{t('booking_flow.download_contract_pdf')}</span>
          </button>
          <button
            onClick={() => setLocation('/dashboard')}
            onTouchEnd={(e) => { e.preventDefault(); setLocation('/dashboard'); }}
            className="btn-gold-outline flex-1 py-3 flex items-center justify-center gap-2 min-h-[48px]"
          >
            <ArrowLeft className="w-5 h-5" style={{ transform: isRTL ? 'scaleX(-1)' : undefined }} />
            <span className="text-sm font-bold">{t('booking_flow.back_to_dashboard')}</span>
          </button>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════
  // RENDER CURRENT STEP
  // ═══════════════════════════════════════════════
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      default: return null;
    }
  };

  // ═══════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════
  return (
    <div className="page-enter min-h-full" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--maham-gold-bg)', border: '1px solid var(--maham-gold-border)' }}>
            <Star className="w-5 h-5" style={{ color: 'var(--maham-gold)' }} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--maham-text-primary)' }}>
              {t('booking_flow.book_exhibition_space')}
            </h1>
            <p className="text-xs" style={{ color: 'var(--maham-text-muted)' }}>
              {t('booking_flow.follow_the_steps_to')}
            </p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      {renderStepper()}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {renderCurrentStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      {currentStep < 7 && (
        <div className="flex items-center justify-between mt-8 pt-5" style={{ borderTop: '1px solid var(--maham-divider)' }}>
          <button
            onClick={prevStep}
            onTouchEnd={(e) => { e.preventDefault(); prevStep(); }}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 min-h-[48px] hover:-translate-y-0.5 will-change-transform"
            style={{
              background: currentStep === 1 ? 'transparent' : 'var(--maham-input-bg)',
              color: currentStep === 1 ? 'var(--maham-text-muted)' : 'var(--maham-text-primary)',
              border: '1px solid var(--maham-divider)',
              opacity: currentStep === 1 ? 0.5 : 1,
            }}
          >
            <ChevronRight className="w-4 h-4" style={{ transform: isRTL ? undefined : 'scaleX(-1)' }} />
            {t('previous')}
          </button>

          <button
            onClick={nextStep}
            onTouchEnd={(e) => { e.preventDefault(); nextStep(); }}
            disabled={!canProceed()}
            className="btn-gold flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold min-h-[48px] transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform"
            style={{
              opacity: canProceed() ? 1 : 0.5,
              cursor: canProceed() ? 'pointer' : 'not-allowed',
            }}
          >
            {t('next')}
            <ChevronLeft className="w-4 h-4" style={{ transform: isRTL ? undefined : 'scaleX(-1)' }} />
          </button>
        </div>
      )}
    </div>
  );
}
