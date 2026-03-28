import { useAuth } from '@/contexts/AuthContext';
import { getLoginUrl } from '@/const';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--maham-page-bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-primary)]" />
          <p className="text-muted-foreground text-sm">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to Manus OAuth login
    window.location.href = getLoginUrl();
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--maham-page-bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-primary)]" />
          <p className="text-muted-foreground text-sm">جاري تحويلك لتسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
