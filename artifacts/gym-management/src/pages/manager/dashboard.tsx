import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, ClipboardCheck, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManagerDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats({ query: { refetchInterval: 3000 } as any });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
        <p className="text-muted-foreground mt-2">Tổng quan hoạt động trong ngày.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Lớp học hôm nay" value={stats.classesToday} icon={Calendar} pastelClass="pastel-emerald" borderHex="#059669" />
          <StatCard title="Đặt chỗ chờ" value={stats.pendingBookings} icon={Clock} pastelClass="pastel-amber" borderHex="#d97706" />
          <StatCard title="Hội viên đang hoạt động" value={stats.activeMembers} icon={Users} pastelClass="pastel-sky" borderHex="#0284c7" />
          <StatCard title="Buổi tập hôm nay" value={stats.sessionsToday} icon={ClipboardCheck} pastelClass="pastel-purple" borderHex="#7c3aed" />
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lịch hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Danh sách lớp học sẽ hiển thị ở đây.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Lịch check-in và đặt chỗ sẽ hiển thị ở đây.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, pastelClass = "pastel-purple", borderHex = "#7c3aed" }: any) {
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
      </div>
    </div>
  );
}
