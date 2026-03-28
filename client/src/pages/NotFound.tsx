import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, ArrowRight } from 'lucide-react';

export default function NotFound() {
  const { language, isRTL, t } = useLanguage();
  return (
    <div className="page-enter min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-8xl font-bold gold-gradient-text mb-4" >404</h1>
        <p className="text-xl text-muted-foreground mb-8">{t('misc.page_not_found')}</p>
        <Link href="/"><Button className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 font-semibold">
          {isRTL ? <ArrowRight className="w-4 h-4 me-2" /> : <ArrowLeft className="w-4 h-4 me-2" />}
          {t('misc.back_to_home')}
        </Button></Link>
      </div>
    </div>
  );
}
