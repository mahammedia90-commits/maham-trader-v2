/**
 * Maham Expo — Trader Dashboard Layout
 * Dual Theme: Light (clean professional) / Dark (luxury showroom with gold)
 * Uses CSS variables from index.css for seamless theme switching
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LayoutDashboard, Building2, Map, Calendar, FileText, CreditCard,
  Briefcase, Clock, BarChart3, Bot, Users, User, Shield,
  MessageSquare, Star, Bell, HelpCircle, LogOut, Menu, X, Sun, Moon,
  ChevronLeft, ChevronRight, ChevronDown, Package, Globe, ShoppingCart
} from 'lucide-react';

const LOGO_DARK = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663193442903/BeyRxPscLHa6nLyozGwKZU/WhatsAppImage2026-01-31at1.03.25AM_dd7db678.jpeg';
const LOGO_WHITE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663193442903/BeyRxPscLHa6nLyozGwKZU/mahamexpologo_fceeac62.webp';

interface NavItem {
  icon: React.ElementType;
  labelKey: string;
  path: string;
  badge?: number;
}

interface NavSection {
  titleKey: string;
  items: NavItem[];
}

const LANG_LIST = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

/* ═══════════════════════════════════════════════
   Theme Toggle Button Component
   Animated sun/moon with rotation + glow
   ═══════════════════════════════════════════════ */
function ThemeToggleButton({ className = '' }: { className?: string }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const [rotating, setRotating] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRotating(true);
    toggleTheme();
    setTimeout(() => setRotating(false), 500);
  }, [toggleTheme]);

  return (
    <button
      type="button"
      onClick={handleClick}
      onTouchEnd={handleClick}
      className={`relative p-2.5 rounded-xl transition-all duration-300 active:scale-90 group ${className}`}
      style={{
        color: isDark ? '#d4a843' : '#8B6914',
        background: isDark ? 'rgba(212, 168, 67, 0.08)' : 'rgba(122,90,14,0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--maham-nav-active-bg)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 0 20px rgba(212, 168, 67, 0.2)'
          : '0 0 15px rgba(212, 168, 67, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--maham-nav-hover-bg)';
        e.currentTarget.style.boxShadow = '';
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className={`transition-transform duration-500 ${rotating ? 'animate-spin' : ''}`}
        style={{ animationDuration: '0.5s' }}
      >
        {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
      </div>
    </button>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarLangOpen, setSidebarLangOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [location] = useLocation();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { user, logout, unreadNotificationsCount, bookings } = useAuth();
  const { isDark } = useTheme();

  const sidebarLangRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);

  const pendingBookings = (bookings ?? []).filter((b: any) => b.status === 'pending_review').length;
  const userName = user?.name ?? 'User';

  useEffect(() => {
    setMobileMenuOpen(false);
    setSidebarLangOpen(false);
    setMobileLangOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (sidebarLangRef.current && !sidebarLangRef.current.contains(target)) {
        setSidebarLangOpen(false);
      }
      if (mobileLangRef.current && !mobileLangRef.current.contains(target)) {
        setMobileLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const handleLangSelect = useCallback((code: string) => {
    setLanguage(code as any);
    setSidebarLangOpen(false);
    setMobileLangOpen(false);
  }, [setLanguage]);

  const handleLogout = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    logout();
  }, [logout]);

  const handleMobileOpen = useCallback(() => {
    setMobileMenuOpen(true);
    setMobileLangOpen(false);
  }, []);

  const handleMobileClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const navSections: NavSection[] = [
    {
      titleKey: 'sidebar.control',
      items: [
        { icon: LayoutDashboard, labelKey: 'nav.dashboard', path: '/dashboard' },
        { icon: Building2, labelKey: 'nav.expos', path: '/expos' },
        { icon: Map, labelKey: 'nav.map', path: '/map' },
      ],
    },
    {
      titleKey: 'sidebar.bookings',
      items: [
        { icon: ShoppingCart, labelKey: 'nav.bookingFlow', path: '/booking-flow' },
        { icon: Calendar, labelKey: 'nav.bookings', path: '/bookings' },
        { icon: FileText, labelKey: 'nav.contracts', path: '/contracts' },
        { icon: CreditCard, labelKey: 'nav.payments', path: '/payments' },
      ],
    },
    {
      titleKey: 'sidebar.operations',
      items: [
        { icon: Briefcase, labelKey: 'nav.operations', path: '/operations' },
        { icon: Package, labelKey: 'nav.services', path: '/services' },
        { icon: Clock, labelKey: 'nav.waitlist', path: '/waitlist' },
      ],
    },
    {
      titleKey: 'sidebar.analytics',
      items: [
        { icon: BarChart3, labelKey: 'nav.analytics', path: '/analytics' },
        { icon: Bot, labelKey: 'nav.ai', path: '/ai-assistant' },
      ],
    },
    {
      titleKey: 'sidebar.team',
      items: [
        { icon: Users, labelKey: 'nav.team', path: '/team' },
      ],
    },
    {
      titleKey: 'sidebar.account',
      items: [
        { icon: User, labelKey: 'nav.profile', path: '/profile' },
        { icon: Shield, labelKey: 'nav.kyc', path: '/kyc' },
        { icon: MessageSquare, labelKey: 'nav.messages', path: '/messages' },
        { icon: Star, labelKey: 'nav.reviews', path: '/reviews' },
        { icon: Bell, labelKey: 'nav.notifications', path: '/notifications', badge: unreadNotificationsCount },
      ],
    },
    {
      titleKey: 'sidebar.support',
      items: [
        { icon: HelpCircle, labelKey: 'nav.help', path: '/help' },
      ],
    },
  ];

  // ═══════════ RENDER: NAV ITEMS ═══════════
  const renderNavItems = (collapsed: boolean) => (
    <nav className="flex-1 overflow-y-auto py-3 px-2 sm:px-2.5 scrollbar-hide">
      {navSections.map((section, si) => (
        <div key={si} className={si > 0 ? 'mt-3 sm:mt-4' : ''}>
          {!collapsed && (
            <p className="text-[10px] tracking-widest px-3 mb-1.5 sm:mb-2 font-semibold uppercase"
              style={{ color: 'var(--maham-section-label)' }}
            >
              {t(section.titleKey)}
            </p>
          )}
          {collapsed && si > 0 && (
            <div className="mx-2 my-2 h-px" style={{ background: 'var(--maham-divider)' }} />
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = location === item.path || (item.path !== '/dashboard' && location.startsWith(item.path + '/'));
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[12px] sm:text-[13px] transition-all duration-250 ease-out relative group cursor-pointer hover:translate-x-0.5 will-change-transform"
                    style={{
                      color: isActive ? 'var(--maham-nav-active-text)' : 'var(--maham-nav-inactive-text)',
                      background: isActive ? 'var(--maham-nav-active-bg)' : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--maham-nav-hover-bg)';
                        e.currentTarget.style.color = 'var(--maham-text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = '';
                        e.currentTarget.style.color = 'var(--maham-nav-inactive-text)';
                      }
                    }}
                  >
                    {isActive && (
                      <div
                        className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-1.5 bottom-1.5 w-[2.5px] rounded-full`}
                        style={{
                          background: 'linear-gradient(180deg, #d4a843 0%, #f0d78c 100%)',
                          boxShadow: '0 0 10px rgba(212, 168, 67, 0.3)',
                        }}
                      />
                    )}
                    <Icon
                      className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] shrink-0 transition-colors duration-300"
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                    {!collapsed && (
                      <span className={`whitespace-nowrap flex-1 transition-colors duration-300 ${isActive ? 'font-semibold' : 'font-normal'}`}>
                        {t(item.labelKey)}
                      </span>
                    )}
                    {!collapsed && item.badge && item.badge > 0 ? (
                      <span className="text-[10px] font-bold min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center rounded-full px-1 sm:px-1.5"
                        style={{
                          background: 'var(--gold-gradient-btn)',
                          color: isDark ? '#0A0A0A' : '#FFFFFF',
                        }}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  // ═══════════ RENDER: LANGUAGE DROPDOWN ═══════════
  const renderLangDropdown = (
    isOpen: boolean,
    setOpen: (v: boolean) => void,
    ref: React.RefObject<HTMLDivElement>,
    position: 'above' | 'below',
    collapsed?: boolean
  ) => (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!isOpen); }}
        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!isOpen); }}
        className={`flex items-center gap-1.5 ${collapsed ? 'p-2' : 'px-2.5 py-1.5'} rounded-xl transition-all duration-300 active:scale-95`}
        style={{ color: 'var(--maham-text-muted)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--maham-nav-hover-bg)';
          e.currentTarget.style.color = 'var(--maham-gold)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '';
          e.currentTarget.style.color = 'var(--maham-text-muted)';
        }}
        aria-label="Change language"
      >
        {!collapsed && <Globe className="w-3.5 h-3.5" />}
        <span className={collapsed ? 'text-xs' : 'text-[10px] font-medium'}>
          {collapsed
            ? LANG_LIST.find(l => l.code === language)?.flag
            : `${LANG_LIST.find(l => l.code === language)?.flag} ${language.toUpperCase()}`
          }
        </span>
        {!collapsed && <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      {isOpen && (
        <div
          className={`absolute ${position === 'above' ? 'bottom-full mb-2 start-0' : 'top-full mt-2 end-0'} w-48 rounded-xl overflow-hidden`}
          style={{
            zIndex: 99999,
                    background: 'var(--glass-bg-elevated)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    border: `1px solid var(--glass-border)`,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(212, 168, 67, 0.05)'
              : '0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03)',
          }}
        >
          <div className="p-1 max-h-[280px] overflow-y-auto">
            {LANG_LIST.map(lang => (
              <button
                key={lang.code}
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLangSelect(lang.code); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handleLangSelect(lang.code); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all duration-150"
                style={{
                  color: language === lang.code ? 'var(--maham-gold)' : 'var(--maham-text-secondary)',
                  background: language === lang.code ? 'var(--maham-nav-active-bg)' : undefined,
                  fontWeight: language === lang.code ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (language !== lang.code) {
                    e.currentTarget.style.background = 'var(--maham-nav-hover-bg)';
                    e.currentTarget.style.color = 'var(--maham-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (language !== lang.code) {
                    e.currentTarget.style.background = '';
                    e.currentTarget.style.color = 'var(--maham-text-secondary)';
                  }
                }}
              >
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.label}</span>
                {language === lang.code && (
                  <div className="ms-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--maham-gold)' }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ═══════════ RENDER: BOTTOM SECTION ═══════════
  const renderBottomSection = (collapsed: boolean) => (
    <div className="p-2 sm:p-3 space-y-2">
      <div className="mx-1 h-px" style={{ background: `linear-gradient(90deg, transparent, var(--maham-divider), transparent)` }} />

      <div className={`flex items-center ${!collapsed ? 'justify-between' : 'flex-col gap-2'} px-1`}>
        <ThemeToggleButton />

        {!collapsed && (
          <>
            {renderLangDropdown(sidebarLangOpen, setSidebarLangOpen, sidebarLangRef as React.RefObject<HTMLDivElement>, 'above', false)}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl transition-all duration-300 active:scale-95 hover:-translate-y-0.5 will-change-transform"
              style={{ color: 'var(--maham-text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(220,38,38,0.08)';
                e.currentTarget.style.color = '#DC2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '';
                e.currentTarget.style.color = 'var(--maham-text-muted)';
              }}
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {!collapsed && user && (
        <Link href="/profile">
          <div className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl transition-all duration-300 group cursor-pointer hover:-translate-y-0.5 will-change-transform"
            style={{
              background: 'var(--maham-gold-bg)',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--maham-gold-border)';
              e.currentTarget.style.boxShadow = 'var(--maham-gold-glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-[11px] sm:text-xs font-bold shrink-0"
              style={{
                background: 'linear-gradient(135deg, #8B6914 0%, #d4a843 100%)',
                color: isDark ? '#0A0A0A' : '#FFFFFF',
                boxShadow: 'var(--maham-btn-gold-shadow)',
              }}
            >
              {userName.charAt(0)}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold truncate" style={{ color: 'var(--maham-text-primary)' }}>{userName}</p>
              <p className="text-[9px] sm:text-[10px] truncate" style={{ color: 'var(--maham-text-muted)' }}>{user.company}</p>
            </div>
          </div>
        </Link>
      )}
    </div>
  );

  const goldGradient = isDark
    ? 'linear-gradient(135deg, #8B6914 0%, #d4a843 30%, #f0d78c 50%, #d4a843 70%, #8B6914 100%)'
    : 'linear-gradient(135deg, #8B6914 0%, #d4a843 30%, #D4B048 50%, #d4a843 70%, #8B6914 100%)';

  // Sovereign Glass Sidebar Style
  const sidebarGlassStyle = {
    background: isDark
      ? 'rgba(10, 10, 10, 0.65)'
      : 'rgba(255, 255, 255, 0.55)',
    backdropFilter: 'blur(32px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(32px) saturate(1.4)',
    borderInlineEnd: `1px solid ${isDark ? 'rgba(212,168,67,0.08)' : 'rgba(212,168,67,0.12)'}`,
    boxShadow: isDark
      ? '4px 0 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03), inset -1px 0 0 rgba(212,168,67,0.04)'
      : '4px 0 30px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7), inset -1px 0 0 rgba(212,168,67,0.06)',
  };

  // Sovereign Glass Header Style
  const headerGlassStyle = {
    background: isDark
      ? 'rgba(10, 10, 10, 0.6)'
      : 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(32px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(32px) saturate(1.4)',
    borderBottom: `1px solid ${isDark ? 'rgba(212,168,67,0.06)' : 'rgba(212,168,67,0.1)'}`,
    boxShadow: isDark
      ? '0 2px 20px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.02)'
      : '0 2px 20px rgba(0,0,0,0.03), inset 0 -1px 0 rgba(255,255,255,0.5)',
  };

  return (
    <div className="min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'} style={{ background: 'var(--maham-page-bg)' }}>

      {/* ═══════════ DESKTOP SIDEBAR ═══════════ */}
      <aside
        className={`
          hidden lg:flex flex-col fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-screen z-40 transition-all duration-300 ease-out
          ${sidebarOpen ? 'w-[240px] xl:w-[250px]' : 'w-[68px] xl:w-[72px]'}
        `}
        style={sidebarGlassStyle}
      >
        {/* Logo */}
        <div className="p-3 xl:p-4 pb-2 xl:pb-3">
          <Link href="/dashboard">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl overflow-hidden shrink-0 ring-1 ring-[#d4a843]/20 group-hover:ring-[#d4a843]/50 transition-all duration-300 shadow-md">
                <img
                  src={isDark ? LOGO_DARK : LOGO_WHITE}
                  alt="Maham Expo"
                  className="w-full h-full object-cover"
                  data-no-filter
                />
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <h1 className="font-bold text-sm tracking-wide whitespace-nowrap" style={{
                    background: goldGradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>MAHAM EXPO</h1>
                  <p className="text-[10px] whitespace-nowrap mt-0.5" style={{ color: 'var(--maham-text-muted)' }}>{t('brand.tagline')}</p>
                </div>
              )}
            </div>
          </Link>
        </div>

        <div className="mx-3 xl:mx-4 h-px" style={{ background: `linear-gradient(90deg, transparent, var(--maham-divider), transparent)` }} />

        {renderNavItems(!sidebarOpen)}
        {renderBottomSection(!sidebarOpen)}

        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`
            absolute top-1/2 -translate-y-1/2 ${isRTL ? '-left-3' : '-right-3'}
            w-6 h-6 xl:w-7 xl:h-7 rounded-full flex items-center justify-center z-50
            transition-all duration-300 hover:scale-110 active:scale-95
          `}
          style={{
            background: 'var(--gold-gradient-btn)',
            color: isDark ? '#0A0A0A' : '#FFFFFF',
            boxShadow: `0 2px 12px rgba(212, 168, 67, 0.3), 0 0 0 2px var(--maham-page-bg)`,
          }}
        >
          {isRTL
            ? (sidebarOpen ? <ChevronRight className="w-3 h-3 xl:w-3.5 xl:h-3.5" /> : <ChevronLeft className="w-3 h-3 xl:w-3.5 xl:h-3.5" />)
            : (sidebarOpen ? <ChevronLeft className="w-3 h-3 xl:w-3.5 xl:h-3.5" /> : <ChevronRight className="w-3 h-3 xl:w-3.5 xl:h-3.5" />)
          }
        </button>
      </aside>

      {/* ═══════════ MOBILE HEADER ═══════════ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-12 sm:h-14 flex items-center justify-between px-3 sm:px-4"
        style={headerGlassStyle}
      >
        <button
          type="button"
          onClick={handleMobileOpen}
          className="p-2 rounded-xl active:scale-95 transition-all duration-300 hover:-translate-y-0.5 will-change-transform"
          style={{ color: 'var(--maham-text-secondary)' }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/dashboard">
          <div className="flex items-center gap-2">
            <img src={isDark ? LOGO_DARK : LOGO_WHITE} alt="Maham Expo" className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover ring-1 ring-[#d4a843]/15" data-no-filter />
            <span className="font-bold text-xs sm:text-sm tracking-wide" style={{
              background: goldGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>MAHAM EXPO</span>
          </div>
        </Link>

        <div className="flex items-center gap-0.5">
          {renderLangDropdown(mobileLangOpen, setMobileLangOpen, mobileLangRef as React.RefObject<HTMLDivElement>, 'below', true)}
          <ThemeToggleButton />
          <Link href="/notifications">
            <div className="p-2 rounded-xl relative transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform" style={{ color: 'var(--maham-text-muted)' }}>
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse"
                  style={{ background: 'var(--maham-gold)', boxShadow: 'var(--maham-gold-glow)' }}
                />
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* ═══════════ MOBILE SIDEBAR OVERLAY ═══════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0"
              style={{ zIndex: 9998, background: 'var(--maham-overlay-bg)', backdropFilter: 'blur(4px)' }}
              onClick={handleMobileClose}
            />
            <motion.aside
              initial={{ x: isRTL ? 300 : -300 }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? 300 : -300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className={`lg:hidden fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-screen w-[280px] sm:w-[300px] flex flex-col`}
              style={{
                zIndex: 9999,
                ...sidebarGlassStyle,
              }}
            >
              <button
                type="button"
                onClick={handleMobileClose}
                className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} p-2 rounded-xl active:scale-95 transition-all duration-300 z-10`}
                style={{ color: 'var(--maham-text-muted)' }}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-4 pb-3">
                <Link href="/dashboard">
                  <div className="flex items-center gap-3 cursor-pointer group" onClick={handleMobileClose}>
                    <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 ring-1 ring-[#d4a843]/20 shadow-md">
                      <img src={isDark ? LOGO_DARK : LOGO_WHITE} alt="Maham Expo" className="w-full h-full object-cover" data-no-filter />
                    </div>
                    <div className="overflow-hidden">
                      <h1 className="font-bold text-sm tracking-wide whitespace-nowrap" style={{
                        background: goldGradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>MAHAM EXPO</h1>
                      <p className="text-[10px] whitespace-nowrap mt-0.5" style={{ color: 'var(--maham-text-muted)' }}>{t('brand.tagline')}</p>
                    </div>
                  </div>
                </Link>
              </div>

              {user && (
                <div className="mx-4 mb-3 p-3 rounded-xl transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform" style={{
                  background: 'var(--maham-gold-bg)',
                  border: `1px solid var(--maham-gold-border)`,
                }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                      background: 'var(--gold-gradient-btn)',
                          color: '#FFFFFF',
                      }}
                    >
                      {userName.charAt(0)}
                    </div>
                    <div className="overflow-hidden flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--maham-text-primary)' }}>{userName}</p>
                      <p className="text-[10px] truncate" style={{ color: 'var(--maham-text-muted)' }}>{user.company}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mx-4 h-px" style={{ background: `linear-gradient(90deg, transparent, var(--maham-divider), transparent)` }} />

              {renderNavItems(false)}

              <div className="p-4 space-y-3" style={{ borderTop: `1px solid var(--maham-divider)` }}>
                <div className="flex items-center justify-between">
                  <ThemeToggleButton />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 active:scale-95 hover:-translate-y-0.5 will-change-transform"
                    style={{ color: 'var(--maham-text-muted)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(220,38,38,0.08)';
                      e.currentTarget.style.color = '#DC2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '';
                      e.currentTarget.style.color = 'var(--maham-text-muted)';
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs">{t('nav.logout') || 'Logout'}</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ease-out pt-12 sm:pt-14 lg:pt-0 ${sidebarOpen ? 'lg:ms-[240px] xl:lg:ms-[250px]' : 'lg:ms-[68px] xl:lg:ms-[72px]'}`}
      >
        {/* Desktop Top Bar */}
        <div className="hidden lg:flex items-center justify-between h-14 xl:h-16 px-4 xl:px-6 sticky top-0 z-30"
          style={headerGlassStyle}
        >
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-5 xl:h-6 rounded-full" style={{
              background: 'linear-gradient(180deg, #d4a843 0%, #2A1F0A 100%)',
            }} />
            <span className="text-sm font-medium" style={{ color: 'var(--maham-text-secondary)' }}>
              {t(navSections.flatMap(s => s.items).find(i => i.path === location)?.labelKey || 'nav.dashboard')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 xl:gap-2">
            <ThemeToggleButton />

            <Link href="/notifications">
              <div className="p-2 xl:p-2.5 rounded-xl transition-all duration-300 relative hover:-translate-y-0.5 will-change-transform"
                style={{ color: 'var(--maham-text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--maham-nav-hover-bg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 xl:top-2 right-1.5 xl:right-2 w-2 h-2 rounded-full animate-pulse"
                    style={{ background: 'var(--maham-gold)', boxShadow: 'var(--maham-gold-glow)' }}
                  />
                )}
              </div>
            </Link>

            {user && (
              <Link href="/profile">
                <div className="flex items-center gap-2 xl:gap-2.5 px-2 xl:px-3 py-1.5 rounded-xl transition-all duration-300 group hover:-translate-y-0.5 will-change-transform"
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--maham-nav-hover-bg)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                >
                  <div className="w-6 h-6 xl:w-7 xl:h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #8B6914 0%, #d4a843 100%)',
                      color: isDark ? '#0A0A0A' : '#FFFFFF',
                    }}
                  >
                    {userName.charAt(0)}
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--maham-text-secondary)' }}>{userName}</span>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-3 sm:p-4 lg:p-5 xl:p-8 max-w-[1500px] mx-auto pb-24 lg:pb-8">
          {children}
        </div>
      </main>

      {/* ═══════════ MOBILE BOTTOM NAV ═══════════ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-1 py-1.5"
        style={{
          background: isDark ? 'rgba(10, 10, 10, 0.7)' : 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(32px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.4)',
          borderTop: `1px solid ${isDark ? 'rgba(212,168,67,0.06)' : 'rgba(212,168,67,0.1)'}`,
          boxShadow: isDark
            ? '0 -2px 20px rgba(0,0,0,0.3)'
            : '0 -2px 20px rgba(0,0,0,0.03)',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        }}
      >
        {[
          { icon: LayoutDashboard, path: '/dashboard', label: t('nav.dashboard') },
          { icon: Building2, path: '/expos', label: t('nav.expos') },
          { icon: Calendar, path: '/bookings', label: t('nav.bookings') },
          { icon: Bot, path: '/ai-assistant', label: t('nav.ai') },
          { icon: Menu, path: '__menu__', label: t('sidebar.more') },
        ].map((item) => {
          const isActive = item.path !== '__menu__' && location === item.path;
          const Icon = item.icon;

          if (item.path === '__menu__') {
            return (
              <button
                key="menu"
                type="button"
                onClick={handleMobileOpen}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-300 min-w-[48px] min-h-[40px] hover:-translate-y-0.5 will-change-transform"
                style={{ color: 'var(--maham-text-muted)' }}
              >
                <Menu className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-[9px] font-medium leading-tight text-center">{item.label}</span>
              </button>
            );
          }

          return (
            <Link key={item.path} href={item.path}>
              <div className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-300 min-w-[48px] min-h-[40px] hover:-translate-y-0.5 will-change-transform"
                style={{ color: isActive ? 'var(--maham-gold)' : 'var(--maham-text-muted)' }}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[9px] font-medium leading-tight text-center">{item.label}</span>
                {isActive && (
                  <div className="w-4 h-0.5 rounded-full" style={{ background: 'var(--maham-gold)' }} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
