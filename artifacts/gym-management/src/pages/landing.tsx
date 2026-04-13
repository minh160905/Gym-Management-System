import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Settings, Dumbbell, User } from "lucide-react";
import { useEffect } from "react";

export default function Landing() {
  const { role, setRole } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (role) {
      setLocation(`/${role}/dashboard`);
    }
  }, [role, setLocation]);

  const handleRoleSelect = (selectedRole: typeof role) => {
    setRole(selectedRole);
    setLocation(`/${selectedRole}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-zinc-950/0 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')] bg-cover bg-center opacity-[0.03] mix-blend-overlay" />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6 ring-1 ring-primary/20">
            <Building2 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
            IRON & FORGE
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            A professional gym operations hub. Fast, clear, and authoritative.
            Select a role to enter the control room.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RoleCard
            title="Gym Owner"
            description="Full access to operations, revenue, and deep analytics."
            icon={Building2}
            onClick={() => handleRoleSelect("owner")}
          />
          <RoleCard
            title="Manager"
            description="Daily operations, members, staff, and class schedules."
            icon={Settings}
            onClick={() => handleRoleSelect("manager")}
          />
          <RoleCard
            title="Trainer"
            description="Manage clients, PT sessions, and workout plans."
            icon={Dumbbell}
            onClick={() => handleRoleSelect("trainer")}
          />
          <RoleCard
            title="Customer"
            description="Book classes, view memberships, and track progress."
            icon={User}
            onClick={() => handleRoleSelect("customer")}
          />
        </div>
      </div>
    </div>
  );
}

function RoleCard({ title, description, icon: Icon, onClick }: any) {
  return (
    <Card 
      className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl hover:border-primary/50 transition-all cursor-pointer group hover:bg-zinc-800/50"
      onClick={onClick}
    >
      <CardHeader>
        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:text-primary transition-colors text-zinc-400">
          <Icon className="w-5 h-5" />
        </div>
        <CardTitle className="text-zinc-100 group-hover:text-primary transition-colors">{title}</CardTitle>
        <CardDescription className="text-zinc-400">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
