/*
 * Design: Fluid Obsidian Glass — AI Assistant with smart responses, suggestions, typing animation
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, User, Sparkles, Loader2, Lightbulb, TrendingUp, MapPin, Calendar, Building2, Zap } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date; }

export default function AIAssistant() {
  const { t, language } = useLanguage();
  const { user, bookings } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      timestamp: new Date(),
      content: language === 'ar'
        ? `مرحباً ${user?.name || 'تاجر'}! 👋\n\nأنا **MAHAM AI** — مساعدك الذكي لإدارة المعارض. يمكنني مساعدتك في:\n\n🏢 **اختيار المعرض الأنسب** لنشاطك التجاري\n📍 **توصيات الأجنحة** بناءً على حركة الزوار والموقع\n💰 **مقارنة الأسعار** والعروض المتاحة\n📊 **تحليل أدائك** في المعارض السابقة\n🛠️ **خدمات العارضين** والباقات المتاحة\n\nكيف يمكنني مساعدتك اليوم؟`
        : `Hello ${user?.name || 'Trader'}! 👋\n\nI'm **MAHAM AI** — your smart expo management assistant. I can help with:\n\n🏢 **Choosing the best expo** for your business\n📍 **Booth recommendations** based on traffic and location\n💰 **Price comparison** and available offers\n📊 **Performance analysis** from previous expos\n🛠️ **Exhibitor services** and available packages\n\nHow can I help you today?`
    }
  ]);
  const { data: allEvents } = useEvents();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const suggestions = language === 'ar'
    ? ['ما أفضل معرض لنشاطي؟', 'أريد مقارنة أسعار الأجنحة', 'ما الخدمات الأكثر طلباً؟', 'كيف أختار موقع الجناح المثالي؟', 'ما المعارض القادمة في الرياض؟', 'نصائح للمشاركة الأولى في معرض']
    : ['Best expo for my business?', 'Compare booth prices', 'Most popular services?', 'How to choose ideal booth location?', 'Upcoming expos in Riyadh?', 'Tips for first-time exhibitors'];

  const generateResponse = (userMsg: string): string => {
    const msg = userMsg.toLowerCase();
    const isAr = language === 'ar';
    const upcomingExpos = (allEvents ?? []).filter((e: any) => e.status === 'upcoming');

    // Expo recommendations
    if (msg.includes('معرض') || msg.includes('expo') || msg.includes('أفضل') || msg.includes('best')) {
      const recommended = upcomingExpos[0];
      return isAr
        ? `بناءً على نشاطك في **${user?.activityType || 'التقنية'}**، أنصحك بشدة بـ:\n\n🏆 **${recommended?.titleAr || 'معرض الرياض الدولي للتقنية'}**\n📍 ${recommended?.city || 'الرياض'} - ${(recommended as any)?.venueName ?? 'مركز المعارض'}\n📅 ${recommended?.startDate ? new Date(recommended.startDate).toLocaleDateString('ar-SA') : '2026-04-15'}
🎯 ${(recommended as any)?.availableUnits ?? 45} جناح متاح
💰 ${(recommended as any)?.priceRange ?? '8,000 - 45,000'} ر.س.س\n\n**لماذا هذا المعرض؟**\n• يتوقع أكثر من 50,000 زائر\n• مناسب لقطاع ${user?.activityType || 'التقنية'}\n• موقع استراتيجي في ${recommended?.city || 'الرياض'}\n• خصم 15% للحجز المبكر\n\nهل تريد أن أساعدك في اختيار الجناح المناسب؟`
        : `Based on your **${user?.activityType || 'Technology'}** business, I strongly recommend:\n\n🏆 **${recommended?.titleEn || 'Riyadh International Tech Expo'}**\n📍 ${recommended?.city || 'Riyadh'} - ${(recommended as any)?.venueName ?? 'Exhibition Center'}\n📅 ${recommended?.startDate ? new Date(recommended.startDate).toLocaleDateString('en-US') : '2026-04-15'}
🎯 ${(recommended as any)?.availableUnits ?? 45} booths available
💰 ${(recommended as any)?.priceRange ?? '8,000 - 45,000'} SARAR\n\n**Why this expo?**\n• Expected 50,000+ visitors\n• Perfect for ${user?.activityType || 'Technology'} sector\n• Strategic location in ${recommended?.city || 'Riyadh'}\n• 15% early bird discount\n\nWould you like help choosing the right booth?`;
    }

    // Price comparison
    if (msg.includes('سعر') || msg.includes('price') || msg.includes('مقارنة') || msg.includes('compare') || msg.includes('كم')) {
      return isAr
        ? `📊 **مقارنة أسعار الأجنحة:**\n\n| النوع | المساحة | السعر (ر.س) | الميزات |\n|-------|---------|-------------|--------|\n| عادي | 9م² | 8,000 - 12,000 | موقع أساسي |\n| مميز | 12م² | 12,000 - 18,000 | موقع مميز + كهرباء إضافية |\n| زاوية | 16م² | 18,000 - 25,000 | واجهتين + رؤية أفضل |\n| جزيرة | 24م² | 35,000 - 50,000 | 4 واجهات + موقع مركزي |\n\n💡 **نصيحتي:** الأجنحة الزاوية تقدم أفضل قيمة مقابل السعر — رؤية من واجهتين بسعر أقل من الجزيرة بـ 40%.\n\nهل تريد أن أساعدك في اختيار النوع المناسب لميزانيتك؟`
        : `📊 **Booth Price Comparison:**\n\n| Type | Area | Price (SAR) | Features |\n|------|------|-------------|----------|\n| Standard | 9m² | 8,000 - 12,000 | Basic location |\n| Premium | 12m² | 12,000 - 18,000 | Prime spot + extra power |\n| Corner | 16m² | 18,000 - 25,000 | Two-sided + better visibility |\n| Island | 24m² | 35,000 - 50,000 | 4-sided + central location |\n\n💡 **My tip:** Corner booths offer the best value — two-sided visibility at 40% less than island booths.\n\nWant help choosing the right type for your budget?`;
    }

    // Services
    if (msg.includes('خدم') || msg.includes('service') || msg.includes('طلب') || msg.includes('popular')) {
      return isAr
        ? `🛠️ **أكثر الخدمات طلباً من العارضين:**\n\n1. 🎨 **تصميم وتجهيز البوث** — من 5,000 ر.س\n   الأكثر طلباً! تصميم 3D + تنفيذ كامل\n\n2. ⚡ **كهرباء وإنارة متقدمة** — من 800 ر.س\n   إضاءة LED + مقابس إضافية\n\n3. 📱 **شاشات عرض رقمية** — من 1,500 ر.س\n   شاشات 55-85 بوصة مع محتوى تفاعلي\n\n4. 🍽️ **ضيافة VIP** — من 2,000 ر.س\n   قهوة + حلويات + مشروبات\n\n5. 📸 **تصوير احترافي** — من 3,000 ر.س\n   فيديو + صور + بث مباشر\n\n💡 **باقة الانطلاقة:** وفّر 20% عند طلب 3 خدمات أو أكثر!\n\nهل تريد أن أضيف خدمات لسلتك؟`
        : `🛠️ **Most Popular Exhibitor Services:**\n\n1. 🎨 **Booth Design & Setup** — from 5,000 SAR\n   Most requested! 3D design + full execution\n\n2. ⚡ **Advanced Electrical & Lighting** — from 800 SAR\n   LED lighting + extra outlets\n\n3. 📱 **Digital Display Screens** — from 1,500 SAR\n   55-85" screens with interactive content\n\n4. 🍽️ **VIP Hospitality** — from 2,000 SAR\n   Coffee + pastries + beverages\n\n5. 📸 **Professional Photography** — from 3,000 SAR\n   Video + photos + live streaming\n\n💡 **Starter Bundle:** Save 20% when ordering 3+ services!\n\nWant me to add services to your cart?`;
    }

    // Booth location
    if (msg.includes('موقع') || msg.includes('location') || msg.includes('مثالي') || msg.includes('ideal') || msg.includes('اختار') || msg.includes('choose')) {
      return isAr
        ? `📍 **نصائح اختيار موقع الجناح المثالي:**\n\n🥇 **المواقع الذهبية (الأعلى حركة):**\n• بجانب المدخل الرئيسي — 40% زيارات أكثر\n• على الممر الرئيسي — رؤية مستمرة\n• بالقرب من منطقة المسرح — جمهور مهتم\n\n🥈 **المواقع الفضية (قيمة ممتازة):**\n• الأجنحة الزاوية — واجهتين بسعر أقل\n• بالقرب من منطقة الطعام — حركة طبيعية\n\n⚠️ **تجنب:**\n• الأجنحة في نهاية الممرات\n• المواقع بعيداً عن المداخل\n• الأجنحة المحاطة بمنافسين مباشرين\n\n💡 استخدم **الخريطة التفاعلية** لرؤية مؤشر الحركة لكل جناح!\n\nهل تريد أن أقترح لك أجنحة محددة؟`
        : `📍 **Tips for Choosing the Ideal Booth Location:**\n\n🥇 **Golden Spots (Highest Traffic):**\n• Next to main entrance — 40% more visits\n• On main aisle — continuous visibility\n• Near stage area — engaged audience\n\n🥈 **Silver Spots (Great Value):**\n• Corner booths — two-sided at lower cost\n• Near food court — natural foot traffic\n\n⚠️ **Avoid:**\n• End-of-aisle booths\n• Locations far from entrances\n• Booths surrounded by direct competitors\n\n💡 Use the **Interactive Map** to see traffic scores for each booth!\n\nWant me to suggest specific booths?`;
    }

    // Upcoming expos
    if (msg.includes('قادم') || msg.includes('upcoming') || msg.includes('رياض') || msg.includes('riyadh')) {
      const expoList = upcomingExpos.map((e: any, i: number) => `${i + 1}. **${isAr ? e.titleAr : e.titleEn}**\n   📍 ${e.city} | 📅 ${e.startDate ? new Date(e.startDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') : ''} | 🎯 ${e.availableUnits ?? '—'} ${t('booths')}`).join('\n\n');
      return isAr
        ? `📅 **المعارض القادمة:**\n\n${expoList}\n\n💡 احجز مبكراً للحصول على أفضل المواقع وخصم 15%!`
        : `📅 **Upcoming Expos:**\n\n${expoList}\n\n💡 Book early for the best locations and 15% discount!`;
    }

    // First time tips
    if (msg.includes('نصائح') || msg.includes('tips') || msg.includes('أول') || msg.includes('first')) {
      return isAr
        ? `🌟 **نصائح للمشاركة الأولى في معرض:**\n\n1. **احجز مبكراً** — أفضل المواقع تُحجز أولاً\n2. **استثمر في تصميم البوث** — الانطباع الأول مهم جداً\n3. **جهّز مواد تسويقية** — بروشورات + بطاقات أعمال\n4. **درّب فريقك** — التواصل الفعال مع الزوار\n5. **استخدم شاشات عرض** — المحتوى المرئي يجذب 3x أكثر\n6. **وفّر ضيافة** — القهوة تجذب الزوار وتطيل وقت التفاعل\n7. **صوّر كل شيء** — للتسويق بعد المعرض\n8. **اجمع بيانات الزوار** — لمتابعة العملاء المحتملين\n\n💡 **ميزانية مقترحة:** خصص 60% للجناح، 25% للخدمات، 15% للتسويق.\n\nهل تريد مساعدة في التخطيط؟`
        : `🌟 **Tips for First-Time Exhibitors:**\n\n1. **Book early** — best spots go first\n2. **Invest in booth design** — first impressions matter\n3. **Prepare marketing materials** — brochures + business cards\n4. **Train your team** — effective visitor communication\n5. **Use display screens** — visual content attracts 3x more\n6. **Offer hospitality** — coffee attracts visitors and extends engagement\n7. **Document everything** — for post-expo marketing\n8. **Collect visitor data** — for lead follow-up\n\n💡 **Suggested budget:** 60% booth, 25% services, 15% marketing.\n\nNeed help with planning?`;
    }

    // Default
    return isAr
      ? `شكراً لسؤالك! 🙏\n\nيمكنني مساعدتك في:\n• اختيار المعرض المناسب\n• مقارنة أسعار الأجنحة\n• توصيات الموقع المثالي\n• خدمات العارضين\n• تحليل الأداء\n\nجرّب أحد الاقتراحات أدناه أو اسألني بشكل مباشر!`
      : `Thanks for your question! 🙏\n\nI can help with:\n• Choosing the right expo\n• Comparing booth prices\n• Ideal location recommendations\n• Exhibitor services\n• Performance analysis\n\nTry one of the suggestions below or ask me directly!`;
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const response = generateResponse(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
      setLoading(false);
    }, 1200 + Math.random() * 800);
  };

  return (
    <div className="page-enter flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-48px)] pb-16 lg:pb-0">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4a843] to-[#8B6914] flex items-center justify-center">
          <Bot className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold" >{t('ai.title')}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {t('ai.online_ready')}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${msg.role === 'assistant' ? 'bg-gradient-to-br from-[#d4a843]/20 to-[#8B6914]/10' : 'bg-primary/10'}`}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-[var(--gold-primary)]" /> : <User className="w-4 h-4 text-primary" />}
            </div>
            <div className={`max-w-[85%] p-3 rounded-xl text-sm whitespace-pre-line ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent/50'}`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4a843]/20 to-[#8B6914]/10 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-[var(--gold-primary)] animate-spin" />
            </div>
            <div className="p-3 rounded-xl bg-accent/50 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 mb-3 max-h-16 overflow-y-auto">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => { setInput(s); inputRef.current?.focus(); }}
            className="px-3 py-1.5 rounded-full text-xs bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 border border-border/30 whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-[var(--gold-primary)]" />{s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={t('ai.placeholder')} className="flex-1" />
        <Button onClick={handleSend} disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 disabled:opacity-50">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
