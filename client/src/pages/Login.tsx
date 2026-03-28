/**
 * Maham Expo — Trader Login
 * Design: Obsidian Glass centered card, cinematic background, Apple-like smooth transitions
 * Flow: Phone → OTP → Profile (3 smooth steps)
 * Uses correct translation keys from LanguageContext
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LOGIN_BG } from '@/lib/mock-data';
import {
  Phone, Lock, User, Shield, Sparkles, Building2, Briefcase, MapPin,
  Globe, ChevronDown, CheckCircle, ArrowLeft, ArrowRight, Sun, Moon
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

const LOGO_WHITE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663193442903/BeyRxPscLHa6nLyozGwKZU/mahamexpologo_fceeac62.webp';

/* ─── Country Codes ─── */
const COUNTRIES = [
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', nameAr: 'السعودية' },
  { code: '+971', flag: '🇦🇪', name: 'UAE', nameAr: 'الإمارات' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain', nameAr: 'البحرين' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait', nameAr: 'الكويت' },
  { code: '+968', flag: '🇴🇲', name: 'Oman', nameAr: 'عمان' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar', nameAr: 'قطر' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey', nameAr: 'تركيا' },
  { code: '+7', flag: '🇷🇺', name: 'Russia', nameAr: 'روسيا' },
  { code: '+86', flag: '🇨🇳', name: 'China', nameAr: 'الصين' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil', nameAr: 'البرازيل' },
  { code: '+98', flag: '🇮🇷', name: 'Iran', nameAr: 'إيران' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine', nameAr: 'أوكرانيا' },
  { code: '+1', flag: '🇺🇸', name: 'USA', nameAr: 'أمريكا' },
  { code: '+44', flag: '🇬🇧', name: 'UK', nameAr: 'بريطانيا' },
  { code: '+33', flag: '🇫🇷', name: 'France', nameAr: 'فرنسا' },
  { code: '+49', flag: '🇩🇪', name: 'Germany', nameAr: 'ألمانيا' },
];

/* ─── Floating Particles ─── */
function GoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; s: number; o: number; p: number }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
        s: Math.random() * 1.5 + 0.5, o: Math.random() * 0.25 + 0.05, p: Math.random() * Math.PI * 2,
      });
    }
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.p += 0.012;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fillStyle = '#d4a843'; ctx.globalAlpha = p.o * (0.5 + 0.5 * Math.sin(p.p)); ctx.fill();
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[1]" />;
}

/* ─── Step Indicator ─── */
function StepDots({ current }: { current: number }) {
  return (
    <div className="page-enter flex items-center gap-2 justify-center mb-8">
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ width: i === current ? 28 : 8, backgroundColor: i <= current ? '#d4a843' : 'rgba(45,36,22,0.12)', opacity: i <= current ? 1 : 0.4 }}
          className="h-2 rounded-full" transition={{ duration: 0.35, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

/* ─── Theme Toggle ─── */
function LoginThemeToggle() {
  const { toggleTheme, isDark } = useTheme();
  const [rotating, setRotating] = useState(false);
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation();
    setRotating(true); toggleTheme();
    setTimeout(() => setRotating(false), 500);
  }, [toggleTheme]);
  return (
    <button type="button" onClick={handleClick} onTouchEnd={handleClick}
      className="p-2 rounded-lg bg-foreground/5 border border-border hover:border-[#d4a843]/30 transition-all duration-300 min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-90"
      aria-label={isDark ? 'Light mode' : 'Dark mode'}>
      <div className={`transition-transform duration-500 ${rotating ? 'animate-spin' : ''}`} style={{ animationDuration: '0.5s', color: '#d4a843' }}>
        {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      </div>
    </button>
  );
}

/* ─── Language Mini Selector ─── */
function LangPicker() {
  const { language, setLanguage, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent | TouchEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    document.addEventListener('touchstart', h);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('touchstart', h); };
  }, []);
  const cur = languages.find(l => l.code === language);
  return (
    <div ref={ref} className="relative">
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-foreground/5 border border-border hover:border-[#d4a843]/30 text-foreground/80 hover:text-foreground text-xs transition-all duration-300 min-h-[40px]">
        <Globe className="w-3.5 h-3.5 text-[var(--gold-primary)]/70" />
        <span>{cur?.flag}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            className="absolute top-full mt-1 end-0 w-48 rounded-xl backdrop-blur-xl border border-border shadow-2xl overflow-hidden z-50 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform"
            style={{ background: 'var(--maham-card-bg, rgba(10,10,16,0.95))' }}>
            {languages.map(lang => (
              <button key={lang.code}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLanguage(lang.code); setOpen(false); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setLanguage(lang.code); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-all duration-300 hover:bg-[var(--gold-primary)]/10 min-h-[40px] ${language === lang.code ? 'bg-[var(--gold-primary)]/15 text-[var(--gold-primary)]' : 'text-foreground/70 hover:text-foreground'}`}>
                <span>{lang.flag}</span><span>{lang.nativeName}</span>
                {language === lang.code && <CheckCircle className="w-3 h-3 ms-auto text-[var(--gold-primary)]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Login() {
  const { t, language, isRTL } = useLanguage();
  const { login, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [, navigate] = useLocation();

  const [step, setStep] = useState(0); // 0=phone, 1=otp, 2=profile
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [countryOpen, setCountryOpen] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [loading, setLoading] = useState(false);

  // Profile
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [activityType, setActivityType] = useState('');
  const [region, setRegion] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countryRef = useRef<HTMLDivElement>(null);
  const dir = isRTL ? 'rtl' : 'ltr';
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // Redirect if already logged in
  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);

  // OTP countdown
  useEffect(() => {
    if (step !== 1 || otpTimer <= 0) return;
    const t = setInterval(() => setOtpTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [step, otpTimer]);

  // Close country dropdown
  useEffect(() => {
    const h = (e: MouseEvent | TouchEvent) => { if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false); };
    document.addEventListener('mousedown', h);
    document.addEventListener('touchstart', h);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('touchstart', h); };
  }, []);

  const handleSendOTP = useCallback(() => {
    if (phoneNumber.length < 5) {
      toast.error(t('profile.please_enter_a_valid'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false); setStep(1); setOtpTimer(60);
      toast.success(t('otpSent'));
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    }, 1000);
  }, [phoneNumber, language, t]);

  const handleOTPChange = useCallback((index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) otpRefs.current[index + 1]?.focus();
    if (value && index === 3 && newOtp.every(d => d)) {
      setLoading(true);
      setTimeout(() => { setLoading(false); setStep(2); toast.success(t('common.verified_successfully')); }, 800);
    }
  }, [otp, language]);

  const handleOTPKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  }, [otp]);

  const handleCreateAccount = useCallback(() => {
    if (!fullName.trim() || !companyName.trim()) {
      toast.error(t('misc.please_complete_required_fields'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(`${countryCode}${phoneNumber}`, {
        name: fullName, company: companyName,
        activityType: activityType || 'technology', region: region || 'riyadh',
      });
      setLoading(false);
      toast.success(t('auth.account_created_welcome_to'));
      navigate('/dashboard');
    }, 1000);
  }, [fullName, companyName, activityType, region, countryCode, phoneNumber, login, navigate, language]);

  const activities = [
    { value: 'technology', label: t('technology') },
    { value: 'food', label: t('food') },
    { value: 'fashion', label: t('fashion') },
    { value: 'health', label: t('health') },
    { value: 'realestate', label: t('realestate') },
    { value: 'automotive', label: t('automotive') },
  ];

  const regions = [
    { value: 'riyadh', label: t('riyadh') },
    { value: 'jeddah', label: t('jeddah') },
    { value: 'dammam', label: t('dammam') },
    { value: 'makkah', label: t('makkah') },
  ];

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode);

  const slideVars = {
    enter: (d: number) => ({ x: d > 0 ? (isRTL ? -200 : 200) : (isRTL ? 200 : -200), opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? (isRTL ? 200 : -200) : (isRTL ? -200 : 200), opacity: 0 }),
  };

  /* ─── Spinner ─── */
  const Spinner = () => (
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-5 h-5 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full" />
  );

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden" dir={dir} style={{ background: 'var(--maham-page-bg)' }}>
      {/* ── Background ── */}
      <div className="absolute inset-0">
        <img src={LOGIN_BG} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0" style={{ background: isDark ? 'linear-gradient(to bottom, rgba(6,6,16,0.5), rgba(6,6,16,0.75), rgba(6,6,16,0.95))' : 'linear-gradient(to bottom, rgba(6,6,16,0.4), rgba(6,6,16,0.6), rgba(6,6,16,0.9))' }} />
      </div>
      <GoldParticles />

      {/* ── Top Bar ── */}
      <div className="absolute top-0 inset-x-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/">
            <motion.img src={LOGO_WHITE} alt="Maham Expo" className="h-8 md:h-10 object-contain drop-shadow-xl"
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} />
          </a>
          <motion.div initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex items-center gap-2">
            <LoginThemeToggle />
            <LangPicker />
          </motion.div>
        </div>
      </div>

      {/* ═══ MAIN CARD — Centered ═══ */}
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 w-full max-w-md mx-3 sm:mx-4">

        <div className="relative rounded-3xl border shadow-2xl overflow-hidden" style={{ background: isDark ? 'linear-gradient(135deg, rgba(20, 20, 35, 0.7), rgba(30, 25, 20, 0.5))' : 'rgba(255,255,255,0.88)', backdropFilter: isDark ? 'blur(30px) saturate(1.5)' : 'blur(40px)', WebkitBackdropFilter: isDark ? 'blur(30px) saturate(1.5)' : 'blur(40px)', borderColor: isDark ? 'rgba(212, 168, 67, 0.12)' : 'rgba(255,255,255,0.6)', boxShadow: isDark ? '0 25px 60px -12px rgba(0,0,0,0.6), 0 0 40px rgba(212,168,67,0.04), inset 0 1px 0 rgba(255,255,255,0.04)' : '0 25px 60px -12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)' }}>
          {/* Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-40 bg-[var(--gold-primary)]/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-5 sm:p-8 md:p-10">
            <StepDots current={step} />

            <AnimatePresence mode="wait" custom={step}>
              {/* ═══ STEP 0: Phone ═══ */}
              {step === 0 && (
                <motion.div key="phone" custom={1} variants={slideVars} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <motion.div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4a843]/20 to-[#d4a843]/5 border border-[#d4a843]/20 flex items-center justify-center"
                      animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                      <Phone className="w-7 h-7 text-[var(--gold-primary)]" />
                    </motion.div>
                  </div>

                  <h2 className="text-2xl font-bold text-foreground text-center mb-2" >
                    {t('welcomeBack')}
                  </h2>
                  <p className="text-muted-foreground/80 text-center text-sm mb-8">{t('loginSubtitle')}</p>

                  <div className="space-y-4">
                    <label className="text-muted-foreground text-xs font-medium block">{t('phoneNumber')}</label>
                    <div className="flex gap-2">
                      {/* Country Code */}
                      <div ref={countryRef} className="relative shrink-0">
                        <button onClick={() => setCountryOpen(!countryOpen)}
                          className="flex items-center gap-1.5 h-12 px-3 rounded-xl bg-foreground/5 border border-border hover:border-[#d4a843]/30 text-foreground text-sm transition-all duration-300 whitespace-nowrap">
                          <span className="text-base">{selectedCountry?.flag}</span>
                          <span className="text-foreground/80" dir="ltr">{countryCode}</span>
                          <ChevronDown className={`w-3 h-3 text-muted-foreground/80 transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {countryOpen && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                              className="absolute top-full mt-1 start-0 w-56 max-h-60 overflow-y-auto rounded-xl backdrop-blur-xl border border-border shadow-2xl z-50 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform"
                              style={{ background: 'var(--maham-card-bg, rgba(10,10,16,0.95))' }}>
                              {COUNTRIES.map(c => (
                                <button key={c.code} onClick={() => { setCountryCode(c.code); setCountryOpen(false); }}
                                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-[var(--gold-primary)]/10 transition-colors ${countryCode === c.code ? 'bg-[var(--gold-primary)]/15 text-[var(--gold-primary)]' : 'text-foreground/70 hover:text-foreground'}`}>
                                  <span>{c.flag}</span>
                                  <span className="flex-1 text-start">{language === 'ar' ? c.nameAr : c.name}</span>
                                  <span className="text-muted-foreground/60" dir="ltr">{c.code}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <Input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder={t('enterPhone')} dir="ltr"
                        className="flex-1 h-12 bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground/40 rounded-xl text-base focus:border-[#d4a843]/40 focus:ring-[#d4a843]/20 transition-all duration-300"
                        onKeyDown={e => e.key === 'Enter' && handleSendOTP()} />
                    </div>

                    <Button onClick={handleSendOTP} disabled={loading || phoneNumber.length < 5}
                      className="w-full h-12 bg-gradient-to-r from-[#d4a843] to-[#8B6914] hover:from-[#d4a843]/90 hover:to-[#8B6914]/90 text-[#FFFFFF] font-bold rounded-xl text-sm shadow-lg shadow-[#d4a843]/20 hover:shadow-[#d4a843]/40 transition-all duration-300 disabled:opacity-40">
                      {loading ? <Spinner /> : <>{t('sendOTP')}<Arrow className="w-4 h-4 ms-2" /></>}
                    </Button>
                  </div>

                  {/* Trust */}
                  <div className="flex items-center justify-center gap-4 mt-8 text-muted-foreground/40 text-xs">
                    <div className="flex items-center gap-1"><Shield className="w-3 h-3 text-[var(--gold-primary)]/40" /><span>{t('securePayments')}</span></div>
                    <div className="w-px h-3 bg-foreground/10" />
                    <div className="flex items-center gap-1"><Lock className="w-3 h-3 text-[var(--gold-primary)]/40" /><span>{t('verifiedTraders')}</span></div>
                  </div>
                </motion.div>
              )}

              {/* ═══ STEP 1: OTP ═══ */}
              {step === 1 && (
                <motion.div key="otp" custom={1} variants={slideVars} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <div className="flex justify-center mb-6">
                    <motion.div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                      <Shield className="w-7 h-7 text-emerald-400" />
                    </motion.div>
                  </div>

                  <h2 className="text-2xl font-bold text-foreground text-center mb-2" >
                    {t('otpSent')}
                  </h2>
                  <p className="text-muted-foreground/80 text-center text-sm mb-2">{t('enterOTP')}</p>
                  <p className="text-[var(--gold-primary)] text-center text-sm font-mono mb-8" dir="ltr">{countryCode} {phoneNumber}</p>

                  {/* OTP Inputs */}
                  <div className="flex justify-center gap-3 mb-6" dir="ltr">
                    {otp.map((digit, i) => (
                      <motion.input key={i} ref={el => { otpRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleOTPChange(i, e.target.value)}
                        onKeyDown={e => handleOTPKeyDown(i, e)}
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-foreground/5 text-foreground outline-none transition-all duration-300 ${digit ? 'border-[#d4a843]/50 shadow-lg shadow-[#d4a843]/10' : 'border-border focus:border-[#d4a843]/40'}`} />
                    ))}
                  </div>

                  {loading && (
                    <div className="flex justify-center mb-4">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-6 h-6 border-2 border-[#d4a843]/30 border-t-[#d4a843] rounded-full" />
                    </div>
                  )}

                  <div className="text-center mb-6">
                    {otpTimer > 0 ? (
                      <span className="text-muted-foreground/60 text-sm">{t('resendIn')} <span className="text-[var(--gold-primary)] font-mono">{otpTimer}</span> {t('seconds')}</span>
                    ) : (
                      <button onClick={() => { setOtpTimer(60); toast.success(t('otpSent')); }} className="text-[var(--gold-primary)] text-sm hover:text-[var(--gold-primary)]/80 transition-colors">
                        {t('resendOTP')}
                      </button>
                    )}
                  </div>

                  <button onClick={() => { setStep(0); setOtp(['', '', '', '']); }}
                    className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-foreground/70 text-sm mx-auto transition-colors">
                    <BackArrow className="w-4 h-4" />{t('back')}
                  </button>
                </motion.div>
              )}

              {/* ═══ STEP 2: Profile ═══ */}
              {step === 2 && (
                <motion.div key="profile" custom={1} variants={slideVars} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <div className="flex justify-center mb-6">
                    <motion.div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4a843]/20 to-[#d4a843]/5 border border-[#d4a843]/20 flex items-center justify-center"
                      initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
                      <Sparkles className="w-7 h-7 text-[var(--gold-primary)]" />
                    </motion.div>
                  </div>

                  <h2 className="text-2xl font-bold text-foreground text-center mb-2" >
                    {t('completeProfile')}
                  </h2>
                  <p className="text-muted-foreground/80 text-center text-sm mb-8">
                    {t('login.complete_profile_subtitle')}
                  </p>

                  <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="text-muted-foreground text-xs font-medium block mb-1.5">{t('fullName')} *</label>
                      <div className="relative">
                        <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input value={fullName} onChange={e => setFullName(e.target.value)}
                          placeholder={t('misc.eg_nour_karam')}
                          className="h-11 ps-10 bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground/40 rounded-xl text-sm focus:border-[#d4a843]/40" />
                      </div>
                    </div>

                    {/* Company */}
                    <div>
                      <label className="text-muted-foreground text-xs font-medium block mb-1.5">{t('companyName')} *</label>
                      <div className="relative">
                        <Building2 className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input value={companyName} onChange={e => setCompanyName(e.target.value)}
                          placeholder={t('profile.eg_maham_company')}
                          className="h-11 ps-10 bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground/40 rounded-xl text-sm focus:border-[#d4a843]/40" />
                      </div>
                    </div>

                    {/* Activity */}
                    <div>
                      <label className="text-muted-foreground text-xs font-medium block mb-1.5">{t('activityType')}</label>
                      <div className="relative">
                        <Briefcase className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 z-10" />
                        <select value={activityType} onChange={e => setActivityType(e.target.value)}
                          className="w-full h-11 ps-10 pe-4 bg-foreground/5 border border-border text-foreground rounded-xl text-sm appearance-none cursor-pointer focus:border-[#d4a843]/40 focus:outline-none transition-all duration-300">
                          <option value="" style={{ background: 'var(--maham-card-bg)' }}>{t('booking_flow.select_activity')}</option>
                          {activities.map(a => <option key={a.value} value={a.value} style={{ background: 'var(--maham-card-bg)' }}>{a.label}</option>)}
                        </select>
                        <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                      </div>
                    </div>

                    {/* Region */}
                    <div>
                      <label className="text-muted-foreground text-xs font-medium block mb-1.5">{t('region')}</label>
                      <div className="relative">
                        <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 z-10" />
                        <select value={region} onChange={e => setRegion(e.target.value)}
                          className="w-full h-11 ps-10 pe-4 bg-foreground/5 border border-border text-foreground rounded-xl text-sm appearance-none cursor-pointer focus:border-[#d4a843]/40 focus:outline-none transition-all duration-300">
                          <option value="" style={{ background: 'var(--maham-card-bg)' }}>{t('map.select_zone')}</option>
                          {regions.map(r => <option key={r.value} value={r.value} style={{ background: 'var(--maham-card-bg)' }}>{r.label}</option>)}
                        </select>
                        <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                      </div>
                    </div>

                    <Button onClick={handleCreateAccount} disabled={loading || !fullName.trim() || !companyName.trim()}
                      className="w-full h-12 bg-gradient-to-r from-[#d4a843] to-[#8B6914] hover:from-[#d4a843]/90 hover:to-[#8B6914]/90 text-[#FFFFFF] font-bold rounded-xl text-sm shadow-lg shadow-[#d4a843]/20 hover:shadow-[#d4a843]/40 transition-all duration-300 mt-2 disabled:opacity-40">
                      {loading ? <Spinner /> : <>{t('createAccount')}<Arrow className="w-4 h-4 ms-2" /></>}
                    </Button>
                  </div>

                  <button onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-foreground/70 text-sm mx-auto mt-4 transition-colors">
                    <BackArrow className="w-4 h-4" />{t('back')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-center text-muted-foreground/30 text-xs mt-6">
          &copy; 2026 Maham Expo — Maham Services &amp; IT
        </motion.p>
      </motion.div>
    </div>
  );
}
