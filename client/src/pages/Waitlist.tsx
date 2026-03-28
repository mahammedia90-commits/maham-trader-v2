import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Clock, Users, CheckCircle, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function Waitlist() {
  const { t, language } = useLanguage();
  const [joined, setJoined] = useState(false);
  const [position] = useState(Math.floor(Math.random() * 50) + 5);

  return (
    <div className="page-enter space-y-6 pb-20 lg:pb-6">
      <h1 className="text-lg sm:text-2xl font-bold" >{t('waitlist.title')}</h1>
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-2xl bg-[var(--gold-primary)]/10 flex items-center justify-center mx-auto mb-6"><Clock className="w-10 h-10 text-[var(--gold-primary)]" /></div>
        <h2 className="text-xl font-bold mb-2">{t('expo.premium_booth_waitlist')}</h2>
        <p className="text-muted-foreground text-sm mb-8">{t('expo.join_the_waitlist_and')}</p>
        {joined ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-3 sm:p-6 rounded-xl glass-card border border-green-500/20 transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="font-semibold text-green-400 mb-2">{t('auth.successfully_registered')}</p>
            <p className="text-sm text-muted-foreground mb-4">{t('waitlist.position')}: <span className="text-[var(--gold-primary)] font-bold text-lg">#{position}</span></p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><Bell className="w-3.5 h-3.5" />{t('misc.you_will_be_notified')}</div>
          </motion.div>
        ) : (
          <Button onClick={() => { setJoined(true); toast.success(t('waitlist.joined_waitlist')); }} className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 font-semibold px-8 py-6 text-base">{t('waitlist.join')}</Button>
        )}
      </div>
    </div>
  );
}
