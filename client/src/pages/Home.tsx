/**
 * Maham Expo - Trader Portal Landing Page
 * Design: Obsidian Glass with cinematic animations
 * Features: AI particles, floating logo, smooth scroll, 8-language support
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Globe, ChevronDown, ArrowLeft, ArrowRight, Star, Shield, Zap,
  Building2, MapPin, Users, TrendingUp, Award, Sparkles,
  Play, CheckCircle2, Clock, FileText, CreditCard, Headphones,
  BarChart3, Bot, Lock, Layers, ArrowUpRight, Menu as MenuIcon, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const LOGO_DARK = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663193442903/BeyRxPscLHa6nLyozGwKZU/WhatsAppImage2026-01-31at1.03.25AM_dd7db678.jpeg';
const LOGO_WHITE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663193442903/BeyRxPscLHa6nLyozGwKZU/mahamexpologo_fceeac62.webp';
const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663193442903/BeyRxPscLHa6nLyozGwKZU/hero-expo-LDg3yfCskQfTDh4aXvYbvk.webp';
const EXPO_HALL_1 = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663193442903/BeyRxPscLHa6nLyozGwKZU/expo-hall-1-ENtJg4p6Lx5UinD7QwvjED.webp';
const EXPO_HALL_2 = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663193442903/BeyRxPscLHa6nLyozGwKZU/expo-hall-2-aAZV9G4oDAyJNx4fU5d27M.webp';

// AI Particle System
function AIParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string; pulse: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#d4a843', '#C9A84C', '#8B6914', '#D4B048', '#E8C547'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const pulseOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = pulseOpacity;
        ctx.fill();

        // Connect nearby particles
        particles.forEach((p2, j) => {
          if (j <= i) return;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 120) * 0.08;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

// Floating orbs background
function FloatingOrbs() {
  return (
    <div className="page-enter absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 200 + i * 100,
            height: 200 + i * 100,
            background: `radial-gradient(circle, rgba(152,112,18,${0.03 + i * 0.01}) 0%, transparent 70%)`,
            left: `${10 + i * 18}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
            y: [0, 20 * (i % 2 === 0 ? -1 : 1), 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Language Selector Dropdown
function LanguageSelector() {
  const { language, setLanguage, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const currentLang = languages.find(l => l.code === language);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-foreground/5 backdrop-blur-md border border-border hover:border-gold/30 transition-all duration-300 text-foreground/90 hover:text-foreground text-sm min-h-[44px]"
      >
        <Globe className="w-4 h-4 text-gold" />
        <span>{currentLang?.flag}</span>
        <span className="hidden sm:inline">{currentLang?.nativeName}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 end-0 w-56 rounded-2xl bg-obsidian-900/95 backdrop-blur-xl border border-border shadow-2xl overflow-hidden"
            style={{ zIndex: 99999 }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLanguage(lang.code); setOpen(false); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setLanguage(lang.code); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-all duration-300 hover:bg-gold/10 min-h-[44px] ${
                  language === lang.code ? 'bg-gold/15 text-gold' : 'text-foreground/80 hover:text-foreground'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.nativeName}</span>
                {language === lang.code && <CheckCircle2 className="w-4 h-4 ms-auto text-gold" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Stats counter with animation
function AnimatedCounter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, end]);

  return (
    <div ref={ref} className="text-2xl sm:text-3xl md:text-4xl font-bold text-gold">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
}

// Feature card with glass effect
function FeatureCard({ icon: Icon, title, description, delay }: {
  icon: any; title: string; description: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-500 overflow-hidden will-change-transform glass-card"
      style={{ contain: 'layout' }}
      onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = 'rgba(212, 168, 67, 0.25)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(212,168,67,0.06), 0 20px 60px rgba(0,0,0,0.3)'; }}
      onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = 'rgba(212, 168, 67, 0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gold/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-gold/20 transition-colors duration-300">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
        </div>
        <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{title}</h3>
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// Process step
function ProcessStep({ number, title, description, icon: Icon, delay }: {
  number: string; title: string; description: string; icon: any; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex gap-3 sm:gap-5 group"
    >
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center group-hover:from-gold/30 group-hover:to-gold/10 transition-all duration-300 shrink-0">
          <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-gold" />
        </div>
        <div className="w-px h-full bg-gradient-to-b from-gold/20 to-transparent mt-2 sm:mt-3" />
      </div>
      <div className="pb-6 sm:pb-10">
        <div className="text-gold/60 text-[10px] sm:text-xs font-mono mb-1">{number}</div>
        <h4 className="text-foreground font-semibold text-sm sm:text-lg mb-1 sm:mb-2">{title}</h4>
        <p className="text-muted-foreground/80 text-xs sm:text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// Theme Toggle for Home page
function HomeThemeToggle() {
  const { toggleTheme, isDark } = useTheme();
  const [rotating, setRotating] = useState(false);
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation();
    setRotating(true); toggleTheme();
    setTimeout(() => setRotating(false), 500);
  }, [toggleTheme]);
  return (
    <button type="button" onClick={handleClick} onTouchEnd={handleClick}
      className="p-2.5 rounded-xl bg-foreground/5 backdrop-blur-md border border-border hover:border-[#d4a843]/30 transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-90"
      aria-label={isDark ? 'Light mode' : 'Dark mode'}
    >
      <div className={`transition-transform duration-500 ${rotating ? 'animate-spin' : ''}`} style={{ animationDuration: '0.5s', color: '#d4a843' }}>
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </div>
    </button>
  );
}

export default function Home() {
  const { t, language, isRTL } = useLanguage();
  const { isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const dir = isRTL ? 'rtl' : 'ltr';
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden" dir={dir} style={{ background: 'var(--maham-page-bg)' }}>
      {/* ===== HEADER ===== */}
      <motion.header
        style={{ opacity: headerOpacity, background: isDark ? 'rgba(10,10,10,0.85)' : 'rgba(250,250,248,0.92)' }}
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/">
            <img src={LOGO_WHITE} alt="Maham Expo" className="h-6 sm:h-8 object-contain" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <HomeThemeToggle />
            <div className="hidden sm:block"><LanguageSelector /></div>
            <Link href="/login">
              <Button className="bg-[var(--gold-primary)]/10 hover:bg-[var(--gold-primary)]/20 text-[var(--gold-primary)] border border-[#d4a843]/25 hover:border-[#d4a843]/40 backdrop-blur-sm font-semibold rounded-xl px-3 sm:px-5 text-xs sm:text-sm">
                {t('login')}
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: isDark ? 'linear-gradient(to bottom, rgba(10,10,10,0.7), rgba(10,10,10,0.5), rgba(10,10,10,1))' : 'linear-gradient(to bottom, rgba(10,10,10,0.6), rgba(10,10,10,0.4), rgba(10,10,10,0.95))' }} />
          <div className="absolute inset-0" style={{ background: isDark ? 'linear-gradient(to right, rgba(10,10,10,0.6), transparent, rgba(10,10,10,0.6))' : 'linear-gradient(to right, rgba(10,10,10,0.5), transparent, rgba(10,10,10,0.5))' }} />
        </motion.div>

        <AIParticles />
        <FloatingOrbs />

        {/* Top Navigation */}
        <div className="absolute top-0 inset-x-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img src={LOGO_WHITE} alt="Maham Expo" className="h-10 md:h-12 object-contain drop-shadow-2xl" />
            </motion.div>

            <div className="flex items-center gap-2 sm:gap-3">
              <HomeThemeToggle />
              <div className="hidden sm:block"><LanguageSelector /></div>
              <Link href="/login">
                <motion.div
                  initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Button className="bg-[var(--gold-primary)]/10 hover:bg-[var(--gold-primary)]/20 text-[var(--gold-primary)] border border-[#d4a843]/25 hover:border-[#d4a843]/40 backdrop-blur-sm font-bold rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm shadow-lg shadow-[#d4a843]/20 hover:shadow-[#d4a843]/40 transition-all duration-300">
                    {t('traderLogin')}
                  </Button>
                </motion.div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2.5 rounded-xl bg-foreground/5 border border-border text-foreground/80 min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 inset-x-0 z-30 sm:hidden"
              style={{
                background: isDark ? 'rgba(10,10,10,0.96)' : 'rgba(250,250,248,0.98)',
                backdropFilter: 'blur(30px)',
                borderBottom: '1px solid var(--maham-divider)',
              }}
            >
              <div className="p-4 space-y-3">
                <LanguageSelector />
                <HomeThemeToggle />
                <Link href="/login">
                  <Button className="w-full bg-[var(--gold-primary)]/10 hover:bg-[var(--gold-primary)]/20 text-[var(--gold-primary)] border border-[#d4a843]/25 hover:border-[#d4a843]/40 backdrop-blur-sm font-bold rounded-xl py-3 text-sm" onClick={() => setMobileMenuOpen(false)}>
                    {t('traderLogin')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Content */}
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6">
          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 backdrop-blur-md mb-8"
          >
            <Sparkles className="w-4 h-4 text-gold animate-pulse" />
            <span className="text-gold text-sm font-medium">{t('poweredByAI')}</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-6 px-2"
          >
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              {t('heroTitle')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2"
          >
            {t('heroSubtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/login">
              <Button
                size="lg"
                className="font-bold rounded-2xl px-6 sm:px-10 py-4 sm:py-6 text-sm sm:text-lg transition-all duration-500 hover:scale-[1.03] group w-full sm:w-auto will-change-transform border"
                style={{ background: 'linear-gradient(135deg, rgba(212,168,67,0.12), rgba(212,168,67,0.04))', border: '1px solid rgba(212,168,67,0.25)', color: '#d4a843', backdropFilter: 'blur(10px)', boxShadow: '0 0 30px rgba(212,168,67,0.1), 0 8px 32px rgba(0,0,0,0.2)' }}
                onMouseEnter={(e: any) => { e.currentTarget.style.boxShadow = '0 0 50px rgba(212,168,67,0.2), 0 12px 40px rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = 'rgba(212,168,67,0.4)'; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(212,168,67,0.1), 0 8px 32px rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor = 'rgba(212,168,67,0.25)'; }}
              >
                {t('startNow')}
                <Arrow className="w-5 h-5 ms-2 group-hover:translate-x-1 transition-transform will-change-transform" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg transition-all duration-500 w-full sm:w-auto will-change-transform hover:scale-[1.02]"
                style={{ background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.15)', color: '#9ca3af', backdropFilter: 'blur(10px)' }}
                onMouseEnter={(e: any) => { e.currentTarget.style.color = '#d4a843'; e.currentTarget.style.borderColor = 'rgba(212,168,67,0.3)'; e.currentTarget.style.background = 'rgba(212,168,67,0.08)'; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(212,168,67,0.15)'; e.currentTarget.style.background = 'rgba(212,168,67,0.05)'; }}
              >
                <Play className="w-5 h-5 me-2" />
                {t('browseExpos')}
              </Button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 sm:mt-12 text-muted-foreground/60 text-xs sm:text-sm"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gold/50" />
              <span>{t('securePayments')}</span>
            </div>
            <div className="w-px h-4 bg-foreground/10" />
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gold/50" />
              <span>{t('verifiedTraders')}</span>
            </div>
            <div className="w-px h-4 bg-foreground/10 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold/50" />
              <span>{t('instantBooking')}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
          >
            <motion.div
              animate={{ opacity: [1, 0], y: [0, 12] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-2 rounded-full bg-gold"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="relative py-12 sm:py-20 border-y" style={{ borderColor: 'var(--maham-divider)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { end: 258, suffix: '+', label: t('activeTraders') },
              { end: 25, suffix: '+', label: t('annualExpos') },
              { end: 1000, suffix: '+', label: t('booths') },
              { end: 48, suffix: '%', label: t('satisfaction') },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                <div className="text-muted-foreground/80 text-sm mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="relative py-12 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium mb-4">
              <Layers className="w-3 h-3" />
              {t('platformFeatures')}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">{t('whyMahamExpo')}</h2>
            <p className="text-muted-foreground/80 max-w-2xl mx-auto">{t('featuresSubtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={MapPin} title={t('interactiveMap')} description={t('interactiveMapDesc')} delay={0} />
            <FeatureCard icon={FileText} title={t('digitalContracts')} description={t('digitalContractsDesc')} delay={0.1} />
            <FeatureCard icon={CreditCard} title={t('securePaymentsFeature')} description={t('securePaymentsDesc')} delay={0.2} />
            <FeatureCard icon={Bot} title={t('aiAssistantFeature')} description={t('aiAssistantDesc')} delay={0.3} />
            <FeatureCard icon={BarChart3} title={t('analyticsFeature')} description={t('analyticsDesc')} delay={0.4} />
            <FeatureCard icon={Headphones} title={t('supportFeature')} description={t('supportDesc')} delay={0.5} />
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-12 sm:py-24 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-start">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium mb-4">
                  <Zap className="w-3 h-3" />
                  {t('howItWorks')}
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">{t('journeyTitle')}</h2>
                <p className="text-muted-foreground/80">{t('journeySubtitle')}</p>
              </motion.div>

              <div>
                <ProcessStep number="01" icon={Users} title={t('step1Title')} description={t('step1Desc')} delay={0} />
                <ProcessStep number="02" icon={MapPin} title={t('step2Title')} description={t('step2Desc')} delay={0.1} />
                <ProcessStep number="03" icon={FileText} title={t('step3Title')} description={t('step3Desc')} delay={0.2} />
                <ProcessStep number="04" icon={CreditCard} title={t('step4Title')} description={t('step4Desc')} delay={0.3} />
                <ProcessStep number="05" icon={Building2} title={t('step5Title')} description={t('step5Desc')} delay={0.4} />
                <ProcessStep number="06" icon={Award} title={t('step6Title')} description={t('step6Desc')} delay={0.5} />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="sticky top-24 hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl">
                <img src={EXPO_HALL_1} alt="Expo Hall" className="w-full aspect-[4/3] object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.8), transparent, transparent)' }} />
                <div className="absolute bottom-6 inset-x-6">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-foreground/10 backdrop-blur-xl border border-border">
                    <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <div className="text-foreground font-semibold text-sm">{t('boothsBooked')}</div>
                      <div className="text-gold text-xs">+23% {t('thisMonth')}</div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-5 rounded-2xl overflow-hidden border border-border"
              >
                <img src={EXPO_HALL_2} alt="Expo" className="w-full aspect-[2/1] object-cover" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== OPERATIONS PREVIEW ===== */}
      <section className="relative py-12 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium mb-4">
              <Building2 className="w-3 h-3" />
              {t('operationsCenter')}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">{t('operationsTitle')}</h2>
            <p className="text-muted-foreground/80 max-w-2xl mx-auto">{t('operationsSubtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: Users, label: t('entryPermits'), color: 'from-blue-500/20 to-blue-500/5' },
              { icon: Award, label: t('employeeBadges'), color: 'from-green-500/20 to-green-500/5' },
              { icon: Building2, label: t('furnishing'), color: 'from-purple-500/20 to-purple-500/5' },
              { icon: Zap, label: t('maintenance'), color: 'from-orange-500/20 to-orange-500/5' },
              { icon: TrendingUp, label: t('supplyDelivery'), color: 'from-cyan-500/20 to-cyan-500/5' },
              { icon: FileText, label: t('approvals'), color: 'from-pink-500/20 to-pink-500/5' },
              { icon: Headphones, label: t('communications'), color: 'from-yellow-500/20 to-yellow-500/5' },
              { icon: Lock, label: t('attachments'), color: 'from-red-500/20 to-red-500/5' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color} border border-border hover:border-white/15 transition-all duration-300 text-center cursor-default`}
              >
                <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-foreground/80 mx-auto mb-2 sm:mb-3" />
                <div className="text-foreground/90 text-[11px] sm:text-sm font-medium">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative py-12 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-6 sm:p-12 md:p-16 rounded-2xl sm:rounded-3xl overflow-hidden glass-luxury"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212, 168, 67, 0.15),transparent_70%)]" />
            <div className="relative z-10">
              <motion.img
                src={LOGO_WHITE}
                alt="Maham Expo"
                className="h-14 mx-auto mb-8 drop-shadow-2xl"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">{t('ctaTitle')}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base">{t('ctaSubtitle')}</p>
              <Link href="/login">
                <Button
                  size="lg"
                  className="font-bold rounded-2xl px-8 sm:px-12 py-4 sm:py-6 text-sm sm:text-lg transition-all duration-500 hover:scale-[1.03] group w-full sm:w-auto will-change-transform border"
                  style={{ background: 'linear-gradient(135deg, rgba(212,168,67,0.12), rgba(212,168,67,0.04))', border: '1px solid rgba(212,168,67,0.25)', color: '#d4a843', backdropFilter: 'blur(10px)', boxShadow: '0 0 30px rgba(212,168,67,0.1), 0 8px 32px rgba(0,0,0,0.2)' }}
                  onMouseEnter={(e: any) => { e.currentTarget.style.boxShadow = '0 0 50px rgba(212,168,67,0.2), 0 12px 40px rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = 'rgba(212,168,67,0.4)'; }}
                  onMouseLeave={(e: any) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(212,168,67,0.1), 0 8px 32px rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor = 'rgba(212,168,67,0.25)'; }}
                >
                  {t('registerNow')}
                  <Arrow className="w-5 h-5 ms-2 group-hover:translate-x-1 transition-transform will-change-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t py-8 sm:py-12" style={{ borderColor: 'var(--maham-divider)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-3">
              <img src={LOGO_WHITE} alt="Maham Expo" className="h-6 sm:h-8 object-contain opacity-60" />
              <span className="text-muted-foreground/60 text-xs sm:text-sm">&copy; 2026 Maham Expo. {t('allRightsReserved')}</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-muted-foreground/60 text-xs sm:text-sm">
              <a href="#" className="hover:text-gold transition-colors">{t('privacyPolicy')}</a>
              <a href="#" className="hover:text-gold transition-colors">{t('termsOfService')}</a>
              <a href="#" className="hover:text-gold transition-colors">{t('contactUs')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
