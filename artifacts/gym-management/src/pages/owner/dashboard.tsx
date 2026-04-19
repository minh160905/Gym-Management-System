import { useGetDashboardStats, useGetRevenueStats, useListEquipment, useListFeedback } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Calendar, CreditCard, Activity, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function OwnerDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: revenue, isLoading: revenueLoading } = useGetRevenueStats();
  const { data: equipment } = useListEquipment();
  const { data: feedback } = useListFeedback();

  const eqOperational = equipment?.filter(e => e.status === "operational").length || 0;
  const eqMaintenance = equipment?.filter(e => e.status === "maintenance").length || 0;
  const eqRetired = equipment?.filter(e => e.status === "retired").length || 0;

  const avgRating = feedback && feedback.length > 0 
    ? (feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length).toFixed(1) 
    : "N/A";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Owner Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of gym performance and metrics.</p>
      </div>

      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            icon={CreditCard}
            trend="+12% from last month"
          />
          <StatCard
            title="Active Members"
            value={stats.activeMembers}
            icon={Users}
            trend={`${stats.memberGrowthPercent}% growth`}
          />
          <StatCard
            title="Classes Today"
            value={stats.classesToday}
            icon={Calendar}
          />
          <StatCard
            title="Expiring Memberships"
            value={stats.expiringSoonCount}
            icon={AlertTriangle}
            alert
          />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Equipment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">Operational</Badge>
                </span>
                <span className="font-bold">{eqOperational}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Maintenance</Badge>
                </span>
                <span className="font-bold">{eqMaintenance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">Retired</Badge>
                </span>
                <span className="font-bold">{eqRetired}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Member Feedback</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {avgRating} / 5.0
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2">
              {feedback?.slice(0, 5).map((f) => (
                <div key={f.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{f.memberName || 'Anonymous'}</span>
                    <span className="text-yellow-500 text-xs">{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{f.comment}</p>
                </div>
              ))}
              {(!feedback || feedback.length === 0) && (
                <p className="text-sm text-muted-foreground">No feedback received yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {revenueLoading ? (
              <Skeleton className="w-full h-full" />
            ) : revenue ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Member Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {revenueLoading ? (
              <Skeleton className="w-full h-full" />
            ) : revenue ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="memberCount" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, alert }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${alert ? 'text-destructive' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}
