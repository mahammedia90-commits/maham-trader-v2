/**
 * Maham Expo - API Hooks Layer
 * Centralized tRPC hooks for all frontend pages
 * Replaces mock data with real API calls
 */
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

// ============================================================
// AUTH & PROFILE
// ============================================================
export function useCurrentUser() {
  const { data: user, isLoading, error } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: Boolean(user),
    error,
  };
}

export function useUpdateProfile() {
  const utils = trpc.useUtils();
  return trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });
}

// ============================================================
// EVENTS
// ============================================================
export function useEvents(filters?: { status?: string; city?: string }) {
  return trpc.events.list.useQuery(filters, {
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

export function useEvent(id: number) {
  return trpc.events.getById.useQuery({ id }, {
    enabled: id > 0,
  });
}

export function useEventDetail(id: number) {
  return trpc.events.getDetail.useQuery({ id }, {
    enabled: id > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useEventUnits(eventId: number) {
  return trpc.events.units.useQuery({ eventId }, {
    enabled: eventId > 0,
  });
}

export function useVenues() {
  return trpc.events.venues.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================================
// BOOKINGS
// ============================================================
export function useBookings() {
  return trpc.bookings.list.useQuery();
}

export function useBooking(id: number) {
  return trpc.bookings.getById.useQuery({ id }, {
    enabled: id > 0,
  });
}

export function useCreateBooking() {
  const utils = trpc.useUtils();
  return trpc.bookings.create.useMutation({
    onSuccess: () => {
      utils.bookings.list.invalidate();
      utils.analytics.stats.invalidate();
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });
}

export function useCancelBooking() {
  const utils = trpc.useUtils();
  return trpc.bookings.cancel.useMutation({
    onSuccess: () => {
      utils.bookings.list.invalidate();
      utils.analytics.stats.invalidate();
    },
  });
}

export function useValidatePromo(code: string, eventId?: number) {
  return trpc.bookings.validatePromo.useQuery({ code, eventId }, {
    enabled: code.length >= 3,
  });
}

// ============================================================
// CONTRACTS
// ============================================================
export function useContracts() {
  return trpc.contracts.list.useQuery();
}

export function useContract(id: number) {
  return trpc.contracts.getById.useQuery({ id }, {
    enabled: id > 0,
  });
}

export function useSignContract() {
  const utils = trpc.useUtils();
  return trpc.contracts.sign.useMutation({
    onSuccess: () => {
      utils.contracts.list.invalidate();
      utils.notifications.list.invalidate();
    },
  });
}

// ============================================================
// PAYMENTS
// ============================================================
export function useInvoices() {
  return trpc.payments.invoices.useQuery();
}

export function usePayments() {
  return trpc.payments.list.useQuery();
}

export function usePaymentSummary() {
  return trpc.payments.summary.useQuery();
}

export function useInitiatePayment() {
  const utils = trpc.useUtils();
  return trpc.payments.initiate.useMutation({
    onSuccess: () => {
      utils.payments.invoices.invalidate();
      utils.payments.list.invalidate();
      utils.payments.summary.invalidate();
      utils.bookings.list.invalidate();
    },
  });
}

export function useConfirmPayment() {
  const utils = trpc.useUtils();
  return trpc.payments.confirm.useMutation({
    onSuccess: () => {
      utils.payments.invoices.invalidate();
      utils.payments.list.invalidate();
      utils.payments.summary.invalidate();
      utils.bookings.list.invalidate();
      utils.analytics.stats.invalidate();
    },
  });
}

// ============================================================
// NOTIFICATIONS
// ============================================================
export function useNotifications() {
  return trpc.notifications.list.useQuery();
}

export function useUnreadNotificationsCount() {
  return trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30 * 1000, // Poll every 30s
  });
}

export function useMarkNotificationRead() {
  const utils = trpc.useUtils();
  return trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });
}

export function useMarkAllNotificationsRead() {
  const utils = trpc.useUtils();
  return trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });
}

// ============================================================
// KYC
// ============================================================
export function useKycStatus() {
  return trpc.kyc.status.useQuery();
}

export function useSubmitKyc() {
  const utils = trpc.useUtils();
  return trpc.kyc.submit.useMutation({
    onSuccess: () => {
      utils.kyc.status.invalidate();
      utils.auth.me.invalidate();
    },
  });
}

// ============================================================
// SUPPORT
// ============================================================
export function useSupportTickets() {
  return trpc.support.list.useQuery();
}

export function useCreateSupportTicket() {
  const utils = trpc.useUtils();
  return trpc.support.create.useMutation({
    onSuccess: () => {
      utils.support.list.invalidate();
    },
  });
}

export function useSupportMessages(ticketId: number) {
  return trpc.support.messages.useQuery({ ticketId }, {
    enabled: ticketId > 0,
    refetchInterval: 10 * 1000,
  });
}

export function useSendSupportMessage() {
  const utils = trpc.useUtils();
  return trpc.support.reply.useMutation({
    onSuccess: (_, variables) => {
      utils.support.messages.invalidate({ ticketId: variables.ticketId });
    },
  });
}

// ============================================================
// SERVICES
// ============================================================
export function useServiceItems() {
  return trpc.services.list.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateServiceOrder() {
  const utils = trpc.useUtils();
  return trpc.services.order.useMutation({
    onSuccess: () => {
      utils.services.myOrders.invalidate();
      utils.payments.invoices.invalidate();
    },
  });
}

export function useMyServiceOrders() {
  return trpc.services.myOrders.useQuery();
}

// ============================================================
// TEAM
// ============================================================
export function useTeamMembers() {
  return trpc.team.list.useQuery();
}

export function useAddTeamMember() {
  const utils = trpc.useUtils();
  return trpc.team.add.useMutation({
    onSuccess: () => {
      utils.team.list.invalidate();
    },
  });
}

export function useRemoveTeamMember() {
  const utils = trpc.useUtils();
  return trpc.team.remove.useMutation({
    onSuccess: () => {
      utils.team.list.invalidate();
    },
  });
}

// ============================================================
// REVIEWS
// ============================================================
export function useReviews() {
  return trpc.reviews.list.useQuery();
}

export function useCreateReview() {
  const utils = trpc.useUtils();
  return trpc.reviews.create.useMutation({
    onSuccess: () => {
      utils.reviews.list.invalidate();
    },
  });
}

// ============================================================
// ANALYTICS
// ============================================================
export function useTraderStats() {
  return trpc.analytics.stats.useQuery(undefined, {
    staleTime: 2 * 60 * 1000,
  });
}

export function useProfileCompletion() {
  return trpc.analytics.profileCompletion.useQuery();
}
