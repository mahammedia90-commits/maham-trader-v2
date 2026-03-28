/*
 * Design: Fluid Obsidian Glass — Reviews with multi-criteria rating and write review modal
 * Data: tRPC hooks (real API)
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, X, Building2, ThumbsUp, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useReviews, useCreateReview } from '@/hooks/useApi';

export default function Reviews() {
  const { t, language } = useLanguage();
  const [showWrite, setShowWrite] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');

  const { data: reviews = [], isLoading } = useReviews();
  const createReview = useCreateReview();

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s: number, r: { rating: number | null }) => s + (r.rating ?? 0), 0) / reviews.length).toFixed(1)
    : '0';

  const handleSubmitReview = () => {
    if (newRating === 0) { toast.error(t('reviews.please_select_a_rating')); return; }
    createReview.mutate(
      { eventId: 1, rating: newRating, comment: newComment || undefined },
      {
        onSuccess: () => {
          setShowWrite(false); setNewRating(0); setNewComment('');
          toast.success(t('reviews.review_submitted_successfully'));
        },
        onError: () => toast.error(t('common.error')),
      }
    );
  };

  const criteria = [
    { key: 'organization', label: t('reviews.organization') },
    { key: 'services', label: t('reviews.services_quality') },
    { key: 'location', label: t('common.location') },
    { key: 'value', label: t('common.value') },
  ];

  if (isLoading) {
    return (
      <div className="page-enter flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gold-primary)]" />
      </div>
    );
  }

  return (
    <div className="page-enter space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-2xl font-bold">{t('reviews.title')}</h1>
        <Button onClick={() => setShowWrite(true)} className="bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 font-semibold text-sm">
          <MessageSquare className="w-4 h-4 me-1" />{t('reviews.write')}
        </Button>
      </div>

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-xl glass-card transition-all duration-300 ease-out hover:-translate-y-0.5 will-change-transform">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="text-center">
            <p className="text-2xl sm:text-4xl font-bold text-[var(--gold-primary)]">{avgRating}</p>
            <div className="flex items-center gap-0.5 mt-1 justify-center">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(Number(avgRating)) ? 'text-[var(--gold-primary)] fill-[#d4a843]' : 'text-muted-foreground'}`} />)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{reviews.length} {t('reviews.reviews')}</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map(star => {
              const count = reviews.filter((r: { rating: number | null }) => (r.rating ?? 0) === star).length;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-end">{star}</span>
                  <Star className="w-3 h-3 text-[var(--gold-primary)] fill-[#d4a843]" />
                  <div className="flex-1 h-2 rounded-full bg-accent/50 overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--gold-primary)]" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="p-12 rounded-xl glass-card text-center">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t('common.no_data')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any, i: number) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl glass-card hover:border-[#d4a843]/20 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[var(--gold-primary)]" />
                  <h3 className="font-semibold text-sm">{review.event?.titleAr ?? review.event?.titleEn ?? t('misc.riyadh_tech_expo')}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(review.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} className={`w-4 h-4 ${si < (review.rating ?? 0) ? 'text-[var(--gold-primary)] fill-[#d4a843]' : 'text-muted-foreground'}`} />
                ))}
                <span className="text-sm font-bold ms-1">{review.rating ?? 0}.0</span>
              </div>

              {/* Criteria (use rating as fallback for all) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {criteria.map(c => (
                  <div key={c.key} className="p-2 rounded-lg bg-accent/30 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">{c.label}</p>
                    <p className="text-sm font-bold">{review.rating ?? 0}/5</p>
                  </div>
                ))}
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              )}

              {/* Helpful */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                <button onClick={() => toast.success(t('misc.thanks_for_your_feedback'))}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" />{t('common.helpful')} (0)
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      <AnimatePresence>
        {showWrite && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowWrite(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-md p-6 rounded-xl glass-card shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{t('reviews.write')}</h3>
                <button onClick={() => setShowWrite(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">{t('dashboard.overall_rating')}</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setNewRating(s)}>
                      <Star className={`w-8 h-8 transition-colors ${s <= newRating ? 'text-[var(--gold-primary)] fill-[#d4a843]' : 'text-muted-foreground'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">{t('common.your_comment')}</p>
                <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                  className="w-full h-24 p-3 rounded-lg bg-accent/50 border border-border/50 text-sm resize-none focus:outline-none focus:border-[#d4a843]/50"
                  placeholder={t('reviews.share_your_expo_experience')} />
              </div>
              <Button onClick={handleSubmitReview} disabled={createReview.isPending}
                className="w-full bg-gradient-to-r from-[#8B6914] via-[#d4a843] to-[#8B6914] text-foreground hover:opacity-90 font-semibold">
                {createReview.isPending ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : null}
                {t('reviews.submit_review')}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
