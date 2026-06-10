import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  BarChart3,
  Calendar,
  ClipboardCheck,
  Dumbbell,
  Clock,
  LogOut,
  Building2,
  Menu,
  Wrench,
  MessageSquare,
  History,
  DollarSign,
  UserPlus,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { role, fullName, logout } = useAuth();
  const [location, navigate] = useLocation();

  if (!role) {
    return <>{children}</>;
  }

  const navItems = {
    owner: [
      { name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
      { name: "Members", href: "/owner/members", icon: Users },
      { name: "Staff", href: "/owner/staff", icon: Briefcase },
      { name: "Memberships", href: "/owner/memberships", icon: CreditCard },
      { name: "Analytics", href: "/owner/analytics", icon: BarChart3 },
      { name: "Revenue", href: "/owner/revenue", icon: DollarSign },
      { name: "Equipment", href: "/owner/equipment", icon: Wrench },
    ],
    manager: [
      { name: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
      { name: "Members", href: "/manager/members", icon: Users },
      { name: "Staff", href: "/manager/staff", icon: Briefcase },
      { name: "Classes", href: "/manager/classes", icon: Calendar },
      { name: "Attendance", href: "/manager/attendance", icon: ClipboardCheck },
      { name: "Thiết bị", href: "/manager/equipment", icon: Wrench },
      { name: "Feedback", href: "/manager/feedback", icon: MessageSquare },
    ],
    trainer: [
      { name: "Dashboard", href: "/trainer/dashboard", icon: LayoutDashboard },
      { name: "Sessions", href: "/trainer/sessions", icon: Clock },
      { name: "Workouts", href: "/trainer/workouts", icon: Dumbbell },
      { name: "Clients", href: "/trainer/clients", icon: Users },
      { name: "Chi tiết thu nhập", href: "/trainer/income", icon: DollarSign },
      { name: "My Profile", href: "/trainer/profile", icon: UserCircle },
    ],
    customer: [
      { name: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
      { name: "Classes", href: "/customer/classes", icon: Calendar },
      { name: "My Bookings", href: "/customer/bookings", icon: Clock },
      { name: "Lịch tập luyện", href: "/customer/schedule", icon: Calendar },
      { name: "Membership", href: "/customer/membership", icon: CreditCard },
      { name: "Hire PT", href: "/customer/hire-pt", icon: UserPlus },
      { name: "Payments", href: "/customer/payments", icon: DollarSign },
      { name: "Training History", href: "/customer/training-history", icon: History },
      { name: "Feedback", href: "/customer/feedback", icon: MessageSquare },
      { name: "My Profile", href: "/customer/profile", icon: UserCircle },
    ],
  };

  const items = navItems[role as keyof typeof navItems] || [];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border bg-sidebar">
          <SidebarHeader className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
              <Building2 className="w-6 h-6" />
              <span>IRON & FORGE</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href}
                    tooltip={item.name}
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4 mr-2" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border">
            <div className="flex flex-col gap-2">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                {fullName ? `Logged in as ${fullName}` : `Logged in as ${role}`}
              </div>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 sticky top-0 z-10 lg:hidden">
            <SidebarTrigger />
            <div className="font-bold ml-4 text-primary">IRON & FORGE</div>
          </header>
          <main className="flex-1 overflow-auto bg-muted/20">
            <div className="container max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
