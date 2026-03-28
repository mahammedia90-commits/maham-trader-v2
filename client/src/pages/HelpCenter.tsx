import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, Search, ChevronDown, ChevronUp, MessageCircle, Phone, Mail, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function HelpCenter() {
  const { t, language } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const faqs = [
    { q: t('expo.how_to_book_a'), a: t('expo.browse_available_expos_select') },
    { q: t('payments.what_payment_methods_are'), a: t('misc.we_accept_credit_cards') },
    { q: t('contracts.how_to_sign_contracts'), a: t('contracts.after_booking_approval_the') },
    { q: t('services.what_exhibitor_services_are'), a: t('expo.we_offer_36_services') },
    { q: t('help.how_to_contact_support'), a: t('profile.contact_us_via_platform') },
  ];

  const filtered = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-enter space-y-6 pb-20 lg:pb-6">
      <h1 className="text-lg sm:text-2xl font-bold" >{t('help.title')}</h1>
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {[
          { icon: MessageCircle, title: t('messages.live_chat'), desc: t('team.chat_with_support_team'), color: '#d4a843' },
          { icon: Phone, title: t('common.call_us'), desc: '0535555900', color: '#4ADE80' },
          { icon: Mail, title: t('team.email'), desc: 'info@mahamexpo.sa', color: '#38BDF8' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -2 }}
            className="p-4 rounded-xl glass-card hover:gold-border-glow transition-all duration-300 cursor-pointer" onClick={() => toast.info(t('common.coming_soon'))}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${item.color}15` }}><item.icon className="w-5 h-5" style={{ color: item.color }} /></div>
            <h3 className="font-semibold text-sm">{item.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </motion.div>
        ))}
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('help.faq')}</h2>
        <div className="relative mb-4"><Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" /><Input placeholder={t('help.search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} className="ps-10" /></div>
        <div className="space-y-2">
          {filtered.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl glass-card overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-4 flex items-center justify-between text-start">
                <span className="font-medium text-sm">{faq.q}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>
              {openFaq === i && <div className="px-4 pb-4"><p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p></div>}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="p-3 sm:p-6 rounded-xl glass-card border border-[#d4a843]/20 text-center transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
        <FileText className="w-10 h-10 text-[var(--gold-primary)] mx-auto mb-3" />
        <h3 className="font-semibold mb-2">{t('help.ticket')}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t('help.no_answer_create_ticket')}</p>
        <Button onClick={() => toast.info(t('common.coming_soon'))} className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 font-semibold">{t('help.ticket')}</Button>
      </div>
    </div>
  );
}
