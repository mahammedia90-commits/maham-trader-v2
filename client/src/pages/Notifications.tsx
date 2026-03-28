import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth, type Notification } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, CreditCard, FileText, CheckCircle, Trash2 } from 'lucide-react';

export default function Notifications() {
  const { t, language } = useLanguage();
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useAuth();

  const typeIcon = (type: string | null) => {
    switch (type) {
      case 'booking': return <Calendar className="w-4 h-4 text-yellow-400" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-green-400" />;
      case 'contract': return <FileText className="w-4 h-4 text-purple-400" />;
      default: return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const getTypeClass = (type: string | null) => {
    switch (type) {
      case 'booking': return 'bg-yellow-500/10';
      case 'payment': return 'bg-green-500/10';
      case 'contract': return 'bg-purple-500/10';
      default: return 'bg-blue-500/10';
    }
  };

  return (
    <div className="page-enter space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-2xl font-bold">{t('notifications.title')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead} className="text-xs">
            <CheckCircle className="w-3.5 h-3.5 me-1" />{t('notifications.mark_read')}
          </Button>
          <Button variant="outline" size="sm" onClick={clearNotifications} className="text-xs text-destructive">
            <Trash2 className="w-3.5 h-3.5 me-1" />{t('notifications.clear_all')}
          </Button>
        </div>
      </div>
      {notifications.length === 0 ? (
        <div className="p-12 rounded-xl glass-card text-center transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t('common.no_data')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif: Notification, i: number) => (
            <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link href={notif.actionUrl || '#'}>
                <div
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-4 rounded-xl glass-card border cursor-pointer hover:gold-border-glow transition-all duration-300 ${
                    !(notif.read ?? notif.isRead) ? 'border-primary/20' : 'border-border/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center ${getTypeClass(notif.type)}`}>
                      {typeIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{language === 'ar' ? notif.titleAr : notif.titleEn}</p>
                        {!(notif.read ?? notif.isRead) && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{language === 'ar' ? notif.messageAr : notif.messageEn}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {new Date(notif.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
