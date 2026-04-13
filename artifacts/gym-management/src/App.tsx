import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { AppLayout } from "@/components/layout";

// Pages
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

// Owner Pages
import OwnerDashboard from "@/pages/owner/dashboard";
import OwnerMembers from "@/pages/owner/members";
import OwnerStaff from "@/pages/owner/staff";
import OwnerMemberships from "@/pages/owner/memberships";
import OwnerAnalytics from "@/pages/owner/analytics";

// Manager Pages
import ManagerDashboard from "@/pages/manager/dashboard";
import ManagerMembers from "@/pages/manager/members";
import ManagerClasses from "@/pages/manager/classes";
import ManagerAttendance from "@/pages/manager/attendance";

// Trainer Pages
import TrainerDashboard from "@/pages/trainer/dashboard";
import TrainerSessions from "@/pages/trainer/sessions";
import TrainerWorkouts from "@/pages/trainer/workouts";
import TrainerClients from "@/pages/trainer/clients";

// Customer Pages
import CustomerDashboard from "@/pages/customer/dashboard";
import CustomerClasses from "@/pages/customer/classes";
import CustomerBookings from "@/pages/customer/bookings";
import CustomerMembership from "@/pages/customer/membership";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      
      {/* Owner Routes */}
      <Route path="/owner/dashboard" component={OwnerDashboard} />
      <Route path="/owner/members" component={OwnerMembers} />
      <Route path="/owner/staff" component={OwnerStaff} />
      <Route path="/owner/memberships" component={OwnerMemberships} />
      <Route path="/owner/analytics" component={OwnerAnalytics} />

      {/* Manager Routes */}
      <Route path="/manager/dashboard" component={ManagerDashboard} />
      <Route path="/manager/members" component={ManagerMembers} />
      <Route path="/manager/classes" component={ManagerClasses} />
      <Route path="/manager/attendance" component={ManagerAttendance} />

      {/* Trainer Routes */}
      <Route path="/trainer/dashboard" component={TrainerDashboard} />
      <Route path="/trainer/sessions" component={TrainerSessions} />
      <Route path="/trainer/workouts" component={TrainerWorkouts} />
      <Route path="/trainer/clients" component={TrainerClients} />

      {/* Customer Routes */}
      <Route path="/customer/dashboard" component={CustomerDashboard} />
      <Route path="/customer/classes" component={CustomerClasses} />
      <Route path="/customer/bookings" component={CustomerBookings} />
      <Route path="/customer/membership" component={CustomerMembership} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppLayout>
              <Router />
            </AppLayout>
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
