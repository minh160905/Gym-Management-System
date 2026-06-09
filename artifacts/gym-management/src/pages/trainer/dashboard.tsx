import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useListSessions, useListClasses, useGetStaff, useListBookings } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckCircle2, Activity, DollarSign, Users, Eye, Calendar } from "lucide-react";

export default function TrainerDashboard() {
  const { staffId } = useAuth();
  
  // Fetch personal training sessions for this trainer
  const { data: sessions = [], isLoading: sessionsLoading } = useListSessions({ 
    trainerId: staffId ?? undefined 
  });
  
  // Fetch classes in charge
  const { data: classes = [], isLoading: classesLoading } = useListClasses({ 
    trainerId: staffId ?? undefined 
  });

  // Fetch trainer profile to get base salary
  const { data: trainerInfo } = useGetStaff(staffId ?? 0, { 
    query: { enabled: !!staffId } 
  });

  // Calculate statistics
  const completedSessionsCount = sessions.filter((s) => s.status === "completed").length;
  const classesCount = classes.length;
  
  const baseSalary = trainerInfo?.salary ? parseFloat(String(trainerInfo.salary)) : 0;
  const extraIncome = completedSessionsCount * 25;
  const totalIncome = baseSalary + extraIncome;

  const isLoading = sessionsLoading || classesLoading;

  const [viewingClassId, setViewingClassId] = useState<number | null>(null);
  const [viewingClassName, setViewingClassName] = useState<string>("");

  const { data: bookings = [], isLoading: bookingsLoading } = useListBookings(
    { classId: viewingClassId ?? undefined },
    { query: { enabled: !!viewingClassId } }
  );

  function getWeeklyScheduleText(scheduledAtStr: string, endDateStr?: string | null) {
    try {
      const startDate = new Date(scheduledAtStr);
      if (isNaN(startDate.getTime())) return { schedule: "Chưa có lịch", start: "", end: "" };
      const daysVi = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      const dayName = daysVi[startDate.getDay()];
      const timeStr = format(startDate, "HH:mm");
      const endDate = endDateStr ? new Date(endDateStr) : new Date(startDate.getTime() + 12 * 7 * 24 * 60 * 60 * 1000);
      return {
        schedule: `${dayName} hàng tuần lúc ${timeStr}`,
        start: format(startDate, "dd/MM/yyyy"),
        end: format(endDate, "dd/MM/yyyy")
      };
    } catch (e) {
      return { schedule: "Chưa có lịch", start: "", end: "" };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển HLV</h1>
        <p className="text-muted-foreground mt-2">Các buổi tập sắp tới và khách hàng của bạn.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden border border-zinc-800 bg-zinc-900/40 backdrop-blur-md transition-all hover:border-emerald-500/30 group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Số session đã dạy</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-extrabold text-zinc-100 tracking-tight">
              {sessionsLoading ? "..." : completedSessionsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Buổi tập cá nhân (PT) đã hoàn thành</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-zinc-800 bg-zinc-900/40 backdrop-blur-md transition-all hover:border-sky-500/30 group">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Số lớp học phụ trách</CardTitle>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20 group-hover:scale-110 transition-transform duration-200">
              <Activity className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-extrabold text-zinc-100 tracking-tight">
              {classesLoading ? "..." : classesCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lớp học thể dục nhóm được giao</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-zinc-800 bg-zinc-900/40 backdrop-blur-md transition-all hover:border-amber-500/30 group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tổng thu nhập trong tháng</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform duration-200">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-extrabold text-zinc-100 tracking-tight">
              ${totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lương cứng: ${baseSalary.toLocaleString()} + PT: ${extraIncome.toLocaleString()} ($25/buổi)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* PT Sessions Card */}
        <Card className="col-span-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Buổi tập PT sắp tới
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-zinc-150 dark:border-zinc-850">
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Ngày & Giờ</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Không có buổi tập nào được lên lịch.
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session) => (
                    <TableRow key={session.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">{session.memberName}</TableCell>
                      <TableCell className="text-zinc-650 dark:text-zinc-350">{format(new Date(session.scheduledAt), 'dd/MM/yyyy, hh:mm a')}</TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400">{session.durationMinutes} phút</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            session.status === 'completed' 
                              ? 'default' 
                              : session.status === 'cancelled' 
                              ? 'destructive' 
                              : 'outline'
                          }
                        >
                          {session.status === 'completed' 
                            ? 'Hoàn thành' 
                            : session.status === 'cancelled' 
                            ? 'Đã hủy' 
                            : 'Đã lên lịch'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Group Classes Card */}
        <Card className="col-span-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-500" />
              Lớp học nhóm phụ trách
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-zinc-150 dark:border-zinc-850">
                  <TableHead>Lớp học</TableHead>
                  <TableHead>Lịch học</TableHead>
                  <TableHead>Sức chứa</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : classes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Bạn chưa được phân công lớp học nhóm nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  classes.map((cls) => {
                    const schedInfo = getWeeklyScheduleText(cls.scheduledAt, cls.endDate);
                    return (
                      <TableRow key={cls.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                        <TableCell>
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">{cls.name}</div>
                          <div className="text-xs text-muted-foreground">{cls.category}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">{schedInfo.schedule}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            Bắt đầu: {schedInfo.start}<br />Kết thúc: {schedInfo.end}
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-700 dark:text-zinc-300">
                          {cls.enrolledCount} / {cls.capacity}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setViewingClassId(cls.id);
                              setViewingClassName(cls.name);
                            }}
                            className="h-8 px-2"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Hội viên
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Registered Customers Dialog */}
      <Dialog open={!!viewingClassId} onOpenChange={(open) => !open && setViewingClassId(null)}>
        <DialogContent className="max-w-md bg-white text-zinc-900 border border-zinc-200 shadow-xl rounded-xl p-6">
          <DialogHeader className="border-b border-zinc-100 pb-3">
            <DialogTitle className="text-xl font-bold text-zinc-900">Danh sách đăng ký lớp</DialogTitle>
            <div className="text-sm text-zinc-500 font-medium mt-1">Lớp học: {viewingClassName}</div>
          </DialogHeader>
          
          <div className="py-4">
            {bookingsLoading ? (
              <div className="text-center py-8 text-zinc-500 font-medium">Đang tải danh sách...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 font-medium">Chưa có hội viên nào đăng ký lớp học này.</div>
            ) : (
              <div className="border border-zinc-150 rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-zinc-50">
                    <TableRow className="border-b border-zinc-200">
                      <TableHead className="text-zinc-700 font-semibold">Tên hội viên</TableHead>
                      <TableHead className="text-zinc-700 font-semibold">Ngày đăng ký</TableHead>
                      <TableHead className="text-zinc-700 font-semibold text-right">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                        <TableCell className="font-semibold text-zinc-800">{booking.memberName || `Hội viên #${booking.memberId}`}</TableCell>
                        <TableCell className="text-zinc-650">
                          {booking.bookedAt ? format(new Date(booking.bookedAt), "dd/MM/yyyy") : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-50">
                            {booking.status === "confirmed" ? "Đã xác nhận" : booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          
          <DialogFooter className="border-t border-zinc-100 pt-3">
            <Button onClick={() => setViewingClassId(null)} className="bg-zinc-900 text-white hover:bg-zinc-800">
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
