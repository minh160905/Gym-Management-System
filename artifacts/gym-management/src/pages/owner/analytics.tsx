import { useGetRevenueStats, useGetClassPopularity, useGetTrainerPerformance, useGetMemberRetention } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, LineChart, Line, AreaChart, Area } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function OwnerAnalytics() {
  const { data: revenue, isLoading: revenueLoading } = useGetRevenueStats();
  const { data: classPop, isLoading: classesLoading } = useGetClassPopularity();
  const { data: trainers, isLoading: trainersLoading } = useGetTrainerPerformance();
  const { data: retention, isLoading: retentionLoading } = useGetMemberRetention();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Phân tích</h1>
        <p className="text-muted-foreground mt-2">Chỉ số hiệu quả hoạt động kinh doanh chi tiết.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {retentionLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : retention ? (
          <>
            <MetricCard title="Tỷ lệ giữ chân" value={`${retention.retentionRate}%`} />
            <MetricCard title="Hội viên đang hoạt động" value={retention.activeCount} />
            <MetricCard title="Hủy đăng ký" value={retention.cancelledCount} />
            <MetricCard title="Gia hạn tháng này" value={retention.renewalsThisMonth} />
          </>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử doanh thu</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {revenueLoading ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                  <RechartsTooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Độ phổ biến lớp học</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {classesLoading ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classPop} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="className" type="category" width={100} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="totalBookings" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hiệu suất HLV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainersLoading ? <Skeleton className="h-40" /> : trainers?.map(trainer => (
              <div key={trainer.trainerId} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium">{trainer.trainerName}</div>
                  <div className="text-sm text-muted-foreground">{trainer.avgRating} / 5.0 Điểm</div>
                </div>
                <div className="flex gap-8 text-right">
                  <div>
                    <div className="text-2xl font-bold">{trainer.totalSessions}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Buổi tập</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{trainer.activeClients}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Khách hàng</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value }: { title: string, value: string | number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">{title}</div>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
