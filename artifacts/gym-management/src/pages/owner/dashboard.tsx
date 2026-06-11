import { useGetDashboardStats, useGetRevenueStats, useListEquipment, useListFeedback } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Calendar, CreditCard, Activity, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function OwnerDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { refetchInterval: 3000 } as any });
  const { data: revenue, isLoading: revenueLoading } = useGetRevenueStats({ query: { refetchInterval: 3000 } as any });
  const { data: equipment } = useListEquipment(undefined, { query: { refetchInterval: 3000 } as any });
  const { data: feedback } = useListFeedback(undefined, { query: { refetchInterval: 3000 } as any });

  const eqOperational = equipment?.filter(e => e.status === "operational").length || 0;
  const eqMaintenance = equipment?.filter(e => e.status === "maintenance").length || 0;
  const eqRetired = equipment?.filter(e => e.status === "retired").length || 0;

  const avgRating = feedback && feedback.length > 0 
    ? (feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length).toFixed(1) 
    : "N/A";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
        <p className="text-muted-foreground mt-2">Tổng quan hiệu suất và số liệu của phòng tập.</p>
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
            title="Doanh thu tháng"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            icon={CreditCard}
            trend="+12% so với tháng trước"
            pastelClass="pastel-emerald"
            borderHex="#059669"
          />
          <StatCard
            title="Hội viên đang hoạt động"
            value={stats.activeMembers}
            icon={Users}
            trend={`${stats.memberGrowthPercent}% tăng trưởng`}
            pastelClass="pastel-sky"
            borderHex="#0284c7"
          />
          <StatCard
            title="Lớp học hôm nay"
            value={stats.classesToday}
            icon={Calendar}
            pastelClass="pastel-purple"
            borderHex="#7c3aed"
          />
          <StatCard
            title="Gói sắp hết hạn"
            value={stats.expiringSoonCount}
            icon={AlertTriangle}
            alert
            pastelClass="pastel-rose"
            borderHex="#e11d48"
          />
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center justify-between">
              <span>Tình trạng thiết bị</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              <div className="pastel-card pastel-emerald p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="text-base font-bold text-black">Hoạt động (Operational)</span>
                </div>
                <span className="font-extrabold text-white bg-emerald-600 px-3.5 py-1 rounded-lg text-sm shadow-sm">{eqOperational}</span>
              </div>
              <div className="pastel-card pastel-amber p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  <span className="text-base font-bold text-black">Bảo trì (Maintenance)</span>
                </div>
                <span className="font-extrabold text-white bg-amber-600 px-3.5 py-1 rounded-lg text-sm shadow-sm">{eqMaintenance}</span>
              </div>
              <div className="pastel-card pastel-rose p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span className="text-base font-bold text-black">Hết dùng (Retired)</span>
                </div>
                <span className="font-extrabold text-white bg-rose-600 px-3.5 py-1 rounded-lg text-sm shadow-sm">{eqRetired}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center justify-between">
              <span>Phản hồi hội viên</span>
              <span className="text-sm font-extrabold text-indigo-750 dark:text-white bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 px-3 py-1 rounded-full">
                {avgRating} / 5.0 ★
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
              {feedback?.slice(0, 5).map((f) => (
                <div key={f.id} className="pastel-card pastel-indigo p-4 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-[15px] text-black">{f.memberName || 'Ẩn danh'}</span>
                    <span className="text-amber-600 text-sm tracking-wider font-bold">{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</span>
                  </div>
                  <p className="text-sm font-semibold text-black leading-relaxed">{f.comment}</p>
                </div>
              ))}
              {(!feedback || feedback.length === 0) && (
                <p className="text-sm font-semibold text-zinc-650 dark:text-white text-center py-4">Chưa có phản hồi nào.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">Doanh thu</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">Tăng trưởng hội viên</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
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

function StatCard({ title, value, icon: Icon, trend, alert, pastelClass = "pastel-purple", borderHex = "#7c3aed" }: any) {
  return (
    <div 
      className={`pastel-card ${pastelClass} p-5 flex flex-col justify-between h-32`}
    >
      <div className="flex items-center justify-between relative z-10">
        <span className="text-xs font-bold uppercase tracking-wider text-black">{title}</span>
        <div 
          className="p-2 rounded-lg border border-black/10"
          style={{ 
            backgroundColor: `${borderHex}20`, 
            color: '#000000' 
          }}
        >
          <Icon className="h-5 w-5 ignore-color" />
        </div>
      </div>
      <div className="relative z-10 mt-1">
        <div className="text-3xl font-black text-black tracking-tight">{value}</div>
        {trend && (
          <p className="text-xs mt-1 flex items-center gap-1">
            <span className="font-bold text-black">{trend}</span>
          </p>
        )}
      </div>
    </div>
  );
}
