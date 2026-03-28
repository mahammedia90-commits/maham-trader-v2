# Maham Expo Trader V2 - REDESIGN Tasks

## CRITICAL: Visual Issues to Fix
- [x] Fix SIDEBAR_CONTROL, SIDEBAR_BOOKINGS, SIDEBAR_OPERATIONS etc. showing as raw English text
- [x] Fix "brand.tagline" showing as raw key in header
- [x] Redesign color scheme: current grey/yellow is dull and outdated
- [x] Redesign cards with real Glass Morphism depth
- [x] Make sidebar 100% Arabic clean
- [x] Redesign Dashboard with premium feel (Apple + Bloomberg level)
- [x] Fix all translation keys showing raw key names

## Design Direction
- Deep black (#0a0a0f) + Real gold (#d4a853) + Clean white
- Glass Morphism cards with backdrop-blur and gradient borders
- Subtle golden glow effects
- Clean Arabic typography
- Smooth framer-motion animations
- Premium 2027 feel

## Glass Buttons & Animations
- [x] Glass Gold CTA buttons with shimmer sweep animation
- [x] Glass Outline buttons with hover glow
- [x] Glass Nav buttons for sidebar
- [x] Badge Pill glass style
- [x] Elastic press animation on click
- [x] Glass reflection overlay effect
- [x] Dark/Light mode compatibility for all buttons

## API Integration (V.2 Plan)
- [x] Upgrade project to full-stack (web-db-user)
- [x] Database Schema - Users table extension (phone, company, activityType, region, kycStatus)
- [x] Database Schema - Events table
- [x] Database Schema - Venues table
- [x] Database Schema - Zones table
- [x] Database Schema - Units/Booths table
- [x] Database Schema - Bookings table with approval workflow
- [x] Database Schema - Contracts table with e-signing
- [x] Database Schema - Invoices table (ZATCA compliant)
- [x] Database Schema - Payments table
- [x] Database Schema - Notifications table
- [x] Database Schema - KYC Documents table
- [x] Database Schema - Reviews table
- [x] Database Schema - Support Tickets table
- [x] Database Schema - Service Cart Items table
- [x] Database Schema - Team Members table
- [x] Database Schema - Promo Codes table
- [x] Database Schema - Exhibitor Services table
- [x] Database Schema - Service Categories table
- [x] Database Schema - Waitlist table
- [x] API Route - Auth (me, profile update)
- [x] API Route - Events (list, detail, search, zones, units)
- [x] API Route - Units/Booths (list by event, availability, map data)
- [x] API Route - Bookings (create, list, status, cancel, validatePromo)
- [x] API Route - Contracts (list, view, sign)
- [x] API Route - Payments (create, list, status)
- [x] API Route - Notifications (list, mark read, clear, unreadCount)
- [x] API Route - KYC (submit, status, getDocuments)
- [x] API Route - Reviews (create, list)
- [x] API Route - Support (create ticket, list, addMessage)
- [x] API Route - Services (list, categories, addToCart, checkout)
- [x] API Route - Analytics (trader stats, revenueByMonth, bookingsByStatus)
- [x] API Route - Team (list, add, update, remove)
- [x] Frontend - AuthContext bridge (tRPC + backward compatible)
- [x] Frontend - API hooks layer (useApi.ts)
- [x] Frontend - ProtectedRoute updated for tRPC
- [x] Frontend - Dashboard connected to real API (events, stats)
- [x] Frontend - Browse Expos connected to real API
- [x] Vitest - 36 tests passing (auth + all API routes)
- [x] Seed data - 2 events, 2 venues, zones, units, services, promo codes
- [x] Frontend - Remove @ts-nocheck from all files (completed)
- [x] Frontend - Full type-safe integration for all pages
- [ ] Stripe payment integration
- [ ] Real-time notifications via WebSocket
- [ ] Advanced features from MAHAM-EXPO-MASTER-V.2 plan

## Type-Safe Migration (Remove @ts-nocheck + Replace Mock Data) - COMPLETED
- [x] Remove @ts-nocheck from all files
- [x] Replace mock data with tRPC hooks in Dashboard.tsx
- [x] Replace mock data with tRPC hooks in BrowseExpos.tsx
- [x] Replace mock data with tRPC hooks in ExpoDetail.tsx
- [x] Replace mock data with tRPC hooks in ExpoMap.tsx
- [x] Replace mock data with tRPC hooks in NewBooking.tsx
- [x] Replace mock data with tRPC hooks in Bookings.tsx
- [x] Replace mock data with tRPC hooks in Contracts.tsx
- [x] Replace mock data with tRPC hooks in Payments.tsx
- [x] Replace mock data with tRPC hooks in Operations.tsx
- [x] Replace mock data with tRPC hooks in Services.tsx
- [x] Replace mock data with tRPC hooks in Waitlist.tsx
- [x] Replace mock data with tRPC hooks in Analytics.tsx
- [x] Replace mock data with tRPC hooks in AIAssistant.tsx
- [x] Replace mock data with tRPC hooks in Team.tsx
- [x] Replace mock data with tRPC hooks in Profile.tsx
- [x] Replace mock data with tRPC hooks in KYCVerification.tsx
- [x] Replace mock data with tRPC hooks in Messages.tsx
- [x] Replace mock data with tRPC hooks in Reviews.tsx
- [x] Replace mock data with tRPC hooks in Notifications.tsx
- [x] Replace mock data with tRPC hooks in Help.tsx
- [x] Ensure 0 TypeScript errors
- [x] All tests passing (36 tests)
- [x] Clean up mock-data.ts (only CDN URLs remain)
