/**
 * useBookingGuard — يتحقق من توثيق حساب التاجر قبل السماح بالحجز
 * 
 * التدفق:
 * 1. التاجر يضغط على أي زر حجز
 * 2. يتم التحقق من kycStatus
 * 3. إذا لم يكن موثقاً → يُوجَّه لـ /booking-flow (يبدأ من التوثيق)
 * 4. إذا كان موثقاً → يُنفَّذ الإجراء المطلوب
 */
import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface BookingGuardOptions {
  /** الإجراء المطلوب تنفيذه إذا كان الحساب موثقاً */
  onVerified?: () => void;
  /** رابط التوجيه إذا كان الحساب موثقاً (بدلاً من onVerified) */
  redirectTo?: string;
  /** هل يتطلب تسجيل دخول أولاً */
  requireAuth?: boolean;
}

export function useBookingGuard() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [, navigate] = useLocation();

  const isVerified = user?.kycStatus === 'verified';
  const isSubmitted = user?.kycStatus === 'submitted';
  const isRejected = user?.kycStatus === 'rejected';
  const isPending = user?.kycStatus === 'pending';

  const checkAndProceed = useCallback((options: BookingGuardOptions = {}) => {
    const { onVerified, redirectTo, requireAuth = true } = options;

    // 1. التحقق من تسجيل الدخول
    if (requireAuth && !isAuthenticated) {
      toast.error(
        language === 'ar' 
          ? 'يجب تسجيل الدخول أولاً للحجز' 
          : 'Please login first to make a booking'
      );
      navigate('/login');
      return false;
    }

    // 2. التحقق من حالة التوثيق
    if (!isVerified) {
      if (isPending) {
        toast.info(
          language === 'ar'
            ? 'يجب توثيق حسابك أولاً قبل الحجز. سيتم توجيهك لإكمال التوثيق.'
            : 'You need to verify your account first. Redirecting to verification...'
        );
      } else if (isSubmitted) {
        toast.info(
          language === 'ar'
            ? 'مستنداتك قيد المراجعة. سيتم إشعارك فور الموافقة.'
            : 'Your documents are under review. You will be notified once approved.'
        );
        return false;
      } else if (isRejected) {
        toast.error(
          language === 'ar'
            ? 'تم رفض التوثيق السابق. يرجى إعادة رفع المستندات.'
            : 'Previous verification was rejected. Please re-upload your documents.'
        );
      }

      // توجيه لصفحة BookingFlow — تبدأ من خطوة التوثيق
      navigate('/booking-flow');
      return false;
    }

    // 3. الحساب موثّق — تنفيذ الإجراء
    if (onVerified) {
      onVerified();
    } else if (redirectTo) {
      navigate(redirectTo);
    }
    return true;
  }, [isAuthenticated, isVerified, isPending, isSubmitted, isRejected, language, navigate]);

  return {
    isVerified,
    isSubmitted,
    isRejected,
    isPending,
    checkAndProceed,
  };
}
