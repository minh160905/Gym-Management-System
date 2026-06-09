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
import OwnerEquipment from "@/pages/owner/equipment";

// Manager Pages
import ManagerDashboard from "@/pages/manager/dashboard";
import ManagerMembers from "@/pages/manager/members";
import ManagerStaff from "@/pages/manager/staff";
import ManagerClasses from "@/pages/manager/classes";
import ManagerAttendance from "@/pages/manager/attendance";
import ManagerEquipment from "@/pages/manager/equipment";
import ManagerFeedback from "@/pages/manager/feedback";

// Trainer Pages
import TrainerDashboard from "@/pages/trainer/dashboard";
import TrainerSessions from "@/pages/trainer/sessions";
import TrainerWorkouts from "@/pages/trainer/workouts";
import TrainerClients from "@/pages/trainer/clients";
import TrainerProfile from "@/pages/trainer/profile";
import TrainerIncome from "@/pages/trainer/income";

// Customer Pages
import CustomerDashboard from "@/pages/customer/dashboard";
import CustomerClasses from "@/pages/customer/classes";
import CustomerBookings from "@/pages/customer/bookings";
import CustomerMembership from "@/pages/customer/membership";
import CustomerHirePT from "@/pages/customer/hire-pt";
import CustomerPayments from "@/pages/customer/payments";
import CustomerTrainingHistory from "@/pages/customer/training-history";
import CustomerFeedback from "@/pages/customer/feedback";
import CustomerProfile from "@/pages/customer/profile";
import CustomerSchedule from "@/pages/customer/schedule";

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
      <Route path="/owner/equipment" component={OwnerEquipment} />

      {/* Manager Routes */}
      <Route path="/manager/dashboard" component={ManagerDashboard} />
      <Route path="/manager/members" component={ManagerMembers} />
      <Route path="/manager/staff" component={ManagerStaff} />
      <Route path="/manager/classes" component={ManagerClasses} />
      <Route path="/manager/attendance" component={ManagerAttendance} />
      <Route path="/manager/equipment" component={ManagerEquipment} />
      <Route path="/manager/feedback" component={ManagerFeedback} />

      {/* Trainer Routes */}
      <Route path="/trainer/dashboard" component={TrainerDashboard} />
      <Route path="/trainer/sessions" component={TrainerSessions} />
      <Route path="/trainer/workouts" component={TrainerWorkouts} />
      <Route path="/trainer/clients" component={TrainerClients} />
      <Route path="/trainer/profile" component={TrainerProfile} />
      <Route path="/trainer/income" component={TrainerIncome} />

      {/* Customer Routes */}
      <Route path="/customer/dashboard" component={CustomerDashboard} />
      <Route path="/customer/classes" component={CustomerClasses} />
      <Route path="/customer/bookings" component={CustomerBookings} />
      <Route path="/customer/membership" component={CustomerMembership} />
      <Route path="/customer/hire-pt" component={CustomerHirePT} />
      <Route path="/customer/payments" component={CustomerPayments} />
      <Route path="/customer/training-history" component={CustomerTrainingHistory} />
      <Route path="/customer/schedule" component={CustomerSchedule} />
      <Route path="/customer/feedback" component={CustomerFeedback} />
      <Route path="/customer/profile" component={CustomerProfile} />

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
