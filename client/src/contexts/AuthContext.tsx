/**
 * Maham Expo - Auth Context (Hybrid: tRPC + Legacy Compatibility)
 * 
 * This context bridges the old localStorage-based auth with the new tRPC-based auth.
 * Pages that use `useAuth()` will continue to work, but data now comes from the API.
 * 
 * Strategy:
 * - Auth state comes from tRPC `auth.me` query (Manus OAuth)
 * - Data operations (bookings, contracts, etc.) use tRPC mutations
 * - Legacy interfaces are maintained for backward compatibility
 * - Service cart remains client-side (localStorage) as it's a UI-only concern
 */
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { getLoginUrl } from '@/const';
import { TRPCClientError } from '@trpc/client';

// Types - kept compatible with existing pages
export interface User {
  id: number;
  openId: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  activityType: string | null;
  region: string | null;
  kycStatus: string | null;
  avatar: string | null;
  email: string | null;
  commercialRegister: string | null;
  role: string;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
  loginMethod: string | null;
}

export interface Expo {
  id: number | string;
  titleAr: string | null;
  titleEn: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  city: string | null;
  venue?: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  expectedVisitors: number | null;
  rating: number | string | null;
  isOfficial: boolean | null;
  status: string;
  totalUnits?: number | null;
  availableUnits?: number | null;
  totalBooths?: number | null;
  availableBooths?: number | null;
  priceRange: string | null;
  categories: string | string[] | null;
  image?: string;
}

export interface Zone {
  id: number | string;
  nameAr?: string | null;
  nameEn?: string | null;
  name?: string;
  color?: string | null;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
}

export interface Booth {
  id: number | string;
  code?: string;
  zone?: string;
  type: string;
  area: number | null;
  price: number | string | null;
  status: string;
  unitStatus?: string;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  amenities?: string[];
  trafficScore?: number | null;
  pricePerSqm?: number | string | null;
  allowedCategories?: string[];
}

export interface Booking {
  id: number;
  orderId: string;
  expoId?: number;
  eventId: number;
  expoTitle?: string;
  boothId?: number;
  unitId: number;
  boothType?: string;
  zone?: string;
  area?: number;
  price?: number;
  totalAmount: string | null;
  status: string;
  createdAt: Date | string;
  reviewedAt?: Date | string | null;
  reviewerNote?: string | null;
  paymentMethod?: string | null;
  contractId?: number | null;
  event?: any;
  unit?: any;
}

export interface Contract {
  id: number;
  contractNumber: string;
  bookingId: number;
  expoNameAr?: string;
  expoNameEn?: string;
  unitDetails?: string;
  totalAmount: string | null;
  signedAt?: Date | string | null;
  signedByUser: boolean | null;
  signedByAdmin: boolean | null;
  status: string;
  terms?: string[];
  createdAt: Date | string;
}

export interface Notification {
  id: number;
  titleAr: string | null;
  titleEn: string | null;
  messageAr: string | null;
  messageEn: string | null;
  type: string | null;
  channel: string | null;
  isRead: boolean | null;
  read?: boolean;
  createdAt: Date | string;
  actionUrl?: string | null;
}

export interface ServiceCartItem {
  serviceId: number | string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  permissions?: string[];
  avatar?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  bookings: Booking[];
  contracts: Contract[];
  notifications: Notification[];
  serviceCart: ServiceCartItem[];
  teamMembers: TeamMember[];
  login: (phone: string, userData: Partial<User>) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  addBooking: (booking: any) => string;
  updateBookingStatus: (bookingId: string | number, status: string, note?: string) => void;
  addContract: (contract: any) => string;
  updateContractStatus: (contractId: string | number, status: string) => void;
  addNotification: (notification: any) => void;
  markNotificationRead: (id: string | number) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  addToServiceCart: (item: Omit<ServiceCartItem, 'quantity'>) => void;
  removeFromServiceCart: (serviceId: string | number) => void;
  updateServiceCartQuantity: (serviceId: string | number, quantity: number) => void;
  clearServiceCart: () => void;
  addTeamMember: (member: any) => void;
  removeTeamMember: (id: string | number) => void;
  unreadNotificationsCount: number;
  // New tRPC-powered methods
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // tRPC auth query
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation();
  const utils = trpc.useUtils();

  // tRPC data queries (only when authenticated)
  const isAuth = Boolean(meQuery.data);
  
  const bookingsQuery = trpc.bookings.list.useQuery(undefined, {
    enabled: isAuth,
    staleTime: 60 * 1000,
  });

  const contractsQuery = trpc.contracts.list.useQuery(undefined, {
    enabled: isAuth,
    staleTime: 60 * 1000,
  });

  const notificationsQuery = trpc.notifications.list.useQuery(undefined, {
    enabled: isAuth,
    staleTime: 30 * 1000,
  });

  const unreadCountQuery = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: isAuth,
    refetchInterval: 30 * 1000,
  });

  const teamQuery = trpc.team.list.useQuery(undefined, {
    enabled: isAuth,
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => utils.auth.me.invalidate(),
  });

  const createBookingMutation = trpc.bookings.create.useMutation({
    onSuccess: () => {
      utils.bookings.list.invalidate();
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const cancelBookingMutation = trpc.bookings.cancel.useMutation({
    onSuccess: () => utils.bookings.list.invalidate(),
  });

  const signContractMutation = trpc.contracts.sign.useMutation({
    onSuccess: () => {
      utils.contracts.list.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  const markNotifReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const addTeamMutation = trpc.team.add.useMutation({
    onSuccess: () => utils.team.list.invalidate(),
  });

  const removeTeamMutation = trpc.team.remove.useMutation({
    onSuccess: () => utils.team.list.invalidate(),
  });

  // Service cart (client-side only)
  const [serviceCart, setServiceCart] = useState<ServiceCartItem[]>(() => loadFromStorage('maham_service_cart', []));
  useEffect(() => { localStorage.setItem('maham_service_cart', JSON.stringify(serviceCart)); }, [serviceCart]);

  // Map tRPC user to our User interface
  const user = useMemo((): User | null => {
    if (!meQuery.data) return null;
    const d = meQuery.data;
    return {
      id: d.id,
      openId: d.openId,
      name: d.name,
      phone: (d as any).phone ?? null,
      company: (d as any).company ?? null,
      activityType: (d as any).activityType ?? null,
      region: (d as any).region ?? null,
      kycStatus: (d as any).kycStatus ?? 'pending',
      avatar: (d as any).avatar ?? null,
      email: d.email,
      commercialRegister: (d as any).commercialRegister ?? null,
      role: d.role,
      isActive: (d as any).isActive ?? true,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      lastSignedIn: d.lastSignedIn,
      loginMethod: d.loginMethod,
    };
  }, [meQuery.data]);

  // Map tRPC data to legacy interfaces
  const bookings = useMemo((): Booking[] => {
    return (bookingsQuery.data ?? []).map((b: any) => ({
      ...b,
      orderId: b.orderId ?? `MX-${b.id}`,
      expoTitle: b.event?.titleAr ?? '',
    }));
  }, [bookingsQuery.data]);

  const contracts = useMemo((): Contract[] => {
    return (contractsQuery.data ?? []).map((c: any) => ({
      ...c,
    }));
  }, [contractsQuery.data]);

  const notifications = useMemo((): Notification[] => {
    return (notificationsQuery.data ?? []).map((n: any) => ({
      ...n,
      read: n.isRead,
    }));
  }, [notificationsQuery.data]);

  const teamMembers = useMemo((): TeamMember[] => {
    return (teamQuery.data ?? []).map((m: any) => ({
      ...m,
      permissions: [],
    }));
  }, [teamQuery.data]);

  const unreadNotificationsCount = unreadCountQuery.data ?? 0;

  // Legacy-compatible methods
  const login = useCallback((_phone: string, _userData: Partial<User>) => {
    // With Manus OAuth, login is handled by redirect
    window.location.href = getLoginUrl();
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED") {
        // Already logged out
      }
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      localStorage.removeItem('maham_service_cart');
    }
  }, [logoutMutation, utils]);

  const updateUser = useCallback((data: Partial<User>) => {
    updateProfileMutation.mutate(data as any);
  }, [updateProfileMutation]);

  const addBooking = useCallback((booking: any) => {
    createBookingMutation.mutate({
      eventId: booking.expoId || booking.eventId,
      unitId: booking.boothId || booking.unitId,
      promoCode: booking.promoCode,
    });
    return "pending"; // Async - ID will come from API
  }, [createBookingMutation]);

  const updateBookingStatus = useCallback((bookingId: string | number, status: string, _note?: string) => {
    if (status === 'cancelled') {
      cancelBookingMutation.mutate({ id: Number(bookingId) });
    }
  }, [cancelBookingMutation]);

  const addContract = useCallback((_contract: any) => {
    // Contracts are created server-side when bookings are approved
    return "server-managed";
  }, []);

  const updateContractStatus = useCallback((contractId: string | number, status: string) => {
    if (status === 'signed') {
      signContractMutation.mutate({ id: Number(contractId) });
    }
  }, [signContractMutation]);

  const addNotification = useCallback((_notification: any) => {
    // Notifications are created server-side
  }, []);

  const markNotificationRead = useCallback((id: string | number) => {
    markNotifReadMutation.mutate({ id: Number(id) });
  }, [markNotifReadMutation]);

  const markAllNotificationsRead = useCallback(() => {
    markAllReadMutation.mutate();
  }, [markAllReadMutation]);

  const clearNotifications = useCallback(() => {
    markAllReadMutation.mutate();
  }, [markAllReadMutation]);

  const addToServiceCart = useCallback((item: Omit<ServiceCartItem, 'quantity'>) => {
    setServiceCart(prev => {
      const existing = prev.find(i => String(i.serviceId) === String(item.serviceId));
      if (existing) {
        return prev.map(i => (String(i.serviceId) === String(item.serviceId) ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromServiceCart = useCallback((serviceId: string | number) => {
    setServiceCart(prev => prev.filter(i => String(i.serviceId) !== String(serviceId)));
  }, []);

  const updateServiceCartQuantity = useCallback((serviceId: string | number, quantity: number) => {
    if (quantity <= 0) {
      setServiceCart(prev => prev.filter(i => String(i.serviceId) !== String(serviceId)));
    } else {
      setServiceCart(prev => prev.map(i => (String(i.serviceId) === String(serviceId) ? { ...i, quantity } : i)));
    }
  }, []);

  const clearServiceCart = useCallback(() => {
    setServiceCart([]);
  }, []);

  const addTeamMember = useCallback((member: any) => {
    addTeamMutation.mutate({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
    });
  }, [addTeamMutation]);

  const removeTeamMember = useCallback((id: string | number) => {
    removeTeamMutation.mutate({ id: Number(id) });
  }, [removeTeamMutation]);

  const refresh = useCallback(() => {
    meQuery.refetch();
    bookingsQuery.refetch();
    contractsQuery.refetch();
    notificationsQuery.refetch();
  }, [meQuery, bookingsQuery, contractsQuery, notificationsQuery]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: isAuth,
        isLoading: meQuery.isLoading,
        bookings,
        contracts,
        notifications,
        serviceCart,
        teamMembers,
        login,
        logout,
        updateUser,
        addBooking,
        updateBookingStatus,
        addContract,
        updateContractStatus,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        addToServiceCart,
        removeFromServiceCart,
        updateServiceCartQuantity,
        clearServiceCart,
        addTeamMember,
        removeTeamMember,
        unreadNotificationsCount,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
