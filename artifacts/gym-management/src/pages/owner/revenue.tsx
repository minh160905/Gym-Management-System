import { useState, useMemo } from "react";
import { useListPayments, useListSessions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { DollarSign, Calendar, CreditCard, Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function OwnerRevenue() {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Fetch data
  const { data: payments = [], isLoading: paymentsLoading } = useListPayments(undefined, { query: { refetchInterval: 3000 } as any });
  const { data: sessions = [], isLoading: sessionsLoading } = useListSessions(undefined, { query: { refetchInterval: 3000 } as any });

  const isLoading = paymentsLoading || sessionsLoading;

  // Generate unique months for selector and chart (last 6 months)
  const last6Months = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(format(d, "yyyy-MM"));
    }
    return months;
  }, []);

  const formatMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    return `Tháng ${month}/${year}`;
  };

  // Generate data for the chart (Membership vs PT revenue month-over-month)
  const chartData = useMemo(() => {
    return last6Months.map(monthStr => {
      const label = formatMonthName(monthStr);

      // Membership paid payments in this month
      const monthPayments = payments.filter(p => 
        p.membershipPlanId !== null && 
        p.status === "paid" && 
        p.paymentDate && 
        p.paymentDate.substring(0, 7) === monthStr
      );
      const membershipRevenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);

      // Completed PT sessions in this month
      const monthSessions = sessions.filter(s => 
        s.status === "completed" && 
        s.scheduledAt && 
        s.scheduledAt.substring(0, 7) === monthStr
      );
      const ptRevenue = monthSessions.length * 50; // $50 per session

      return {
        month: monthStr,
        label,
        "Membership": membershipRevenue,
        "PT Sessions": ptRevenue,
        "Tổng doanh thu": membershipRevenue + ptRevenue
      };
    });
  }, [payments, sessions, last6Months]);

  // Filtered membership payments for the selected month
  const filteredPayments = useMemo(() => {
    let result = payments.filter(p => p.membershipPlanId !== null && p.status === "paid");
    if (selectedMonth !== "all") {
      result = result.filter(p => p.paymentDate && p.paymentDate.substring(0, 7) === selectedMonth);
    }
    return result;
  }, [payments, selectedMonth]);

  // Filtered PT sessions for the selected month
  const filteredSessions = useMemo(() => {
    let result = sessions.filter(s => s.status === "completed" || s.status === "scheduled");
    if (selectedMonth !== "all") {
      result = result.filter(s => s.scheduledAt && s.scheduledAt.substring(0, 7) === selectedMonth);
    }
    return result;
  }, [sessions, selectedMonth]);

  // Calculations for cards
  const membershipRevenue = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  const completedSessions = useMemo(() => {
    return filteredSessions.filter(s => s.status === "completed");
  }, [filteredSessions]);

  const ptRevenue = useMemo(() => {
    return completedSessions.length * 50;
  }, [completedSessions]);

  const totalRevenue = membershipRevenue + ptRevenue;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Quản lý doanh thu</h1>
          <p className="text-muted-foreground mt-1">Theo dõi tiền thu từ gói hội viên và các buổi PT cá nhân.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Chọn kỳ báo cáo:</span>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px] bg-background border-zinc-200">
              <SelectValue placeholder="Tất cả thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thời gian</SelectItem>
              {last6Months.map(month => (
                <SelectItem key={month} value={month}>
                  {formatMonthName(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden border border-emerald-200 dark:border-emerald-900 bg-emerald-50/10 dark:bg-emerald-950/10 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Tổng doanh thu</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Membership + PT Sessions</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-sky-100 dark:border-sky-900 bg-sky-50/10 dark:bg-sky-950/10 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-sky-800 dark:text-sky-300 uppercase tracking-wider">Doanh thu Membership</CardTitle>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">${membershipRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Từ tiền bán & gia hạn gói tập</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-amber-100 dark:border-amber-900 bg-amber-50/10 dark:bg-amber-950/10 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Doanh thu PT Sessions</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">${ptRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Số buổi hoàn thành × $50.00</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lịch PT hoàn thành</CardTitle>
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{completedSessions.length} buổi</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Số session PT đã dạy hoàn thành</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Xu hướng doanh thu (6 tháng gần đây)
          </CardTitle>
          <CardDescription>So sánh doanh thu thực tế thu được từ gói Membership và PT cá nhân.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="Membership" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
                <Bar dataKey="PT Sessions" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Detailed Tables */}
      <Tabs defaultValue="membership" className="space-y-4">
        <TabsList className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <TabsTrigger value="membership" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950">Doanh thu gói tập</TabsTrigger>
          <TabsTrigger value="pt" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950">Lịch PT cá nhân</TabsTrigger>
        </TabsList>

        <TabsContent value="membership">
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Danh sách hóa đơn gói tập</CardTitle>
              <CardDescription>Các khoản thanh toán gói Membership thành công từ hội viên.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-200 dark:border-zinc-800">
                    <TableHead>Hội viên</TableHead>
                    <TableHead>Gói tập</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Phương thức</TableHead>
                    <TableHead className="text-right">Ngày thanh toán</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Đang tải danh sách...
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        Không có hóa đơn gói tập nào phát sinh trong kỳ này.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((p) => (
                      <TableRow key={p.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                        <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">{p.memberName || `Hội viên #${p.memberId}`}</TableCell>
                        <TableCell>{p.membershipPlanName || "Gói tập"}</TableCell>
                        <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="capitalize">{p.paymentMethod || "Mặc định"}</TableCell>
                        <TableCell className="text-right text-zinc-500">{p.paymentDate ? format(new Date(p.paymentDate), "dd/MM/yyyy") : "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pt">
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Danh sách buổi dạy PT</CardTitle>
              <CardDescription>Chi tiết các buổi dạy PT cá nhân đã được lên lịch hoặc hoàn thành.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-200 dark:border-zinc-800">
                    <TableHead>Hội viên</TableHead>
                    <TableHead>Huấn luyện viên</TableHead>
                    <TableHead>Ngày & Giờ tập</TableHead>
                    <TableHead>Thời lượng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Doanh thu ghi nhận</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Đang tải danh sách...
                      </TableCell>
                    </TableRow>
                  ) : filteredSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        Không có lịch dạy PT nào phát sinh trong kỳ này.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSessions.map((s) => {
                      const isCompleted = s.status === "completed";
                      return (
                        <TableRow key={s.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                          <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">{s.memberName || `Hội viên #${s.memberId}`}</TableCell>
                          <TableCell>{s.trainerName || `Trainer #${s.trainerId}`}</TableCell>
                          <TableCell>{s.scheduledAt ? format(new Date(s.scheduledAt), "dd/MM/yyyy · HH:mm") : "-"}</TableCell>
                          <TableCell>{s.durationMinutes} phút</TableCell>
                          <TableCell>
                            {isCompleted ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-250 border flex items-center gap-1 w-fit hover:bg-emerald-100">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Hoàn thành
                              </Badge>
                            ) : s.status === "scheduled" ? (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-250 border flex items-center gap-1 w-fit">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Đã lên lịch
                              </Badge>
                            ) : (
                              <Badge variant="secondary">{s.status}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                            {isCompleted ? "+$50.00" : "$0.00"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
