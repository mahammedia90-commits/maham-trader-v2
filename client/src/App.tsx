import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Loader2 } from "lucide-react";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Browse = lazy(() => import("./pages/Browse"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BrowseExpos = lazy(() => import("./pages/BrowseExpos"));
const ExpoDetail = lazy(() => import("./pages/ExpoDetail"));
const ExpoMap = lazy(() => import("./pages/ExpoMap"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Contracts = lazy(() => import("./pages/Contracts"));
const Payments = lazy(() => import("./pages/Payments"));
const ExhibitorServices = lazy(() => import("./pages/ExhibitorServices"));
const Operations = lazy(() => import("./pages/Operations"));
const Waitlist = lazy(() => import("./pages/Waitlist"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const TeamManagement = lazy(() => import("./pages/TeamManagement"));
const Profile = lazy(() => import("./pages/Profile"));
const KYC = lazy(() => import("./pages/KYC"));
const Messages = lazy(() => import("./pages/Messages"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Notifications = lazy(() => import("./pages/Notifications"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const BookingFlow = lazy(() => import("./pages/BookingFlow"));
const NotFound = lazy(() => import("./pages/NotFound"));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function ProtectedDashboardRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Component />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/browse" component={Browse} />

        {/* Protected routes with DashboardLayout */}
        <Route path="/dashboard">{() => <ProtectedDashboardRoute component={Dashboard} />}</Route>
        <Route path="/expos">{() => <ProtectedDashboardRoute component={BrowseExpos} />}</Route>
        <Route path="/expos/:id">{() => <ProtectedDashboardRoute component={ExpoDetail} />}</Route>
        <Route path="/map">{() => <ProtectedDashboardRoute component={ExpoMap} />}</Route>
        <Route path="/bookings">{() => <ProtectedDashboardRoute component={Bookings} />}</Route>
        <Route path="/contracts">{() => <ProtectedDashboardRoute component={Contracts} />}</Route>
        <Route path="/payments">{() => <ProtectedDashboardRoute component={Payments} />}</Route>
        <Route path="/operations">{() => <ProtectedDashboardRoute component={Operations} />}</Route>
        <Route path="/services">{() => <ProtectedDashboardRoute component={ExhibitorServices} />}</Route>
        <Route path="/waitlist">{() => <ProtectedDashboardRoute component={Waitlist} />}</Route>
        <Route path="/analytics">{() => <ProtectedDashboardRoute component={Analytics} />}</Route>
        <Route path="/ai-assistant">{() => <ProtectedDashboardRoute component={AIAssistant} />}</Route>
        <Route path="/team">{() => <ProtectedDashboardRoute component={TeamManagement} />}</Route>
        <Route path="/profile">{() => <ProtectedDashboardRoute component={Profile} />}</Route>
        <Route path="/kyc">{() => <ProtectedDashboardRoute component={KYC} />}</Route>
        <Route path="/messages">{() => <ProtectedDashboardRoute component={Messages} />}</Route>
        <Route path="/reviews">{() => <ProtectedDashboardRoute component={Reviews} />}</Route>
        <Route path="/notifications">{() => <ProtectedDashboardRoute component={Notifications} />}</Route>
        <Route path="/help">{() => <ProtectedDashboardRoute component={HelpCenter} />}</Route>
        <Route path="/booking-flow">{() => <ProtectedDashboardRoute component={BookingFlow} />}</Route>

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
