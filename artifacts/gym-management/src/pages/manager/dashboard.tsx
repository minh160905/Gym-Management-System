import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, ClipboardCheck, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManagerDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats({ query: { refetchInterval: 3000 } });

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
          <StatCard title="Lớp học hôm nay" value={stats.classesToday} icon={Calendar} />
          <StatCard title="Đặt chỗ chờ" value={stats.pendingBookings} icon={Clock} />
          <StatCard title="Hội viên đang hoạt động" value={stats.activeMembers} icon={Users} />
          <StatCard title="Buổi tập hôm nay" value={stats.sessionsToday} icon={ClipboardCheck} />
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

function StatCard({ title, value, icon: Icon }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
