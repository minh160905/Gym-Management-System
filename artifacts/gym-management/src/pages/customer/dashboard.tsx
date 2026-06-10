import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useListBookings, useListAttendance, useListSessions, useGetClass } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { CalendarCheck2, Activity, Dumbbell } from "lucide-react";

export default function CustomerDashboard() {
  const { memberId } = useAuth();
  const { data: bookings = [], isLoading: bookingsLoading } = useListBookings({ memberId: memberId ?? undefined }, { query: { refetchInterval: 3000 } });
  const { data: attendance = [], isLoading: attendanceLoading } = useListAttendance({ memberId: memberId ?? undefined }, { query: { refetchInterval: 3000 } });
  const { data: sessions = [], isLoading: sessionsLoading } = useListSessions({ memberId: memberId ?? undefined }, { query: { refetchInterval: 3000 } });

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  // Fetch class details for dialog
  const { data: classDetail, isLoading: classLoading } = useGetClass(selectedClassId ?? 0, {
    query: { enabled: !!selectedClassId }
  });

  // Thống kê điều chỉnh cho tài khoản demo Customer theo yêu cầu:
  // Ngày checkin: 201, Lớp học tham gia: 56, Buổi tập riêng cùng PT: 25
  const checkInDaysCount = 201;
  const classesJoinedCount = 56;
  const completedSessionsCount = 25;

  const isLoading = bookingsLoading || attendanceLoading || sessionsLoading;

  // Limit bookings count to show only the first 3 for a tidier screen
  const displayedBookings = bookings.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
        <p className="text-muted-foreground mt-2">Hành trình tập luyện của bạn.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden border border-zinc-800 bg-zinc-900/40 backdrop-blur-md transition-all hover:border-emerald-500/30 group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tổng số ngày đã Check in</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-200">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-extrabold text-zinc-100 tracking-tight">
              {attendanceLoading ? "..." : checkInDaysCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ngày luyện tập tại phòng gym</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-zinc-800 bg-zinc-900/40 backdrop-blur-md transition-all hover:border-sky-500/30 group">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Số lớp học đã tham gia</CardTitle>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20 group-hover:scale-110 transition-transform duration-200">
              <Activity className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-extrabold text-zinc-100 tracking-tight">
              {bookingsLoading ? "..." : classesJoinedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lớp học thể dục nhóm đã xác nhận</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-zinc-800 bg-zinc-900/40 backdrop-blur-md transition-all hover:border-amber-500/30 group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Số sessions đã hoàn thành</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform duration-200">
              <Dumbbell className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-extrabold text-zinc-100 tracking-tight">
              {sessionsLoading ? "..." : completedSessionsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Buổi tập riêng với HLV cá nhân</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Lớp học sắp tới của tôi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lớp học</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : displayedBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Bạn chưa đăng ký lớp học nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-medium">{booking.className}</div>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-xs text-primary hover:underline mt-1"
                          onClick={() => setSelectedClassId(booking.classId)}
                        >
                          Xem chi tiết lớp học
                        </Button>
                      </TableCell>
                      <TableCell>{format(new Date(booking.bookedAt), 'dd/MM/yyyy, hh:mm a')}</TableCell>
                      <TableCell>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status === 'confirmed' ? 'Đã xác nhận' : booking.status === 'cancelled' ? 'Đã hủy' : booking.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {bookings.length > 3 && (
              <div className="px-4 py-3 border-t text-xs text-muted-foreground">
                Hiển thị 3 / {bookings.length} lớp học sắp tới của bạn để màn hình gọn gàng hơn
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Class Detail Dialog */}
      <Dialog open={!!selectedClassId} onOpenChange={(open) => !open && setSelectedClassId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết lớp học</DialogTitle>
          </DialogHeader>

          {classLoading ? (
            <div className="py-6 text-center text-muted-foreground">Đang tải chi tiết lớp học...</div>
          ) : classDetail ? (
            <div className="space-y-4 pt-2">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">{classDetail.name}</h3>
                <Badge variant="secondary" className="capitalize mt-1">{classDetail.category}</Badge>
              </div>

              <div className="space-y-2 text-sm text-zinc-700">
                {classDetail.description && (
                  <div className="pb-2 border-b border-zinc-200 text-zinc-600 text-xs">
                    {classDetail.description}
                  </div>
                )}
                <div className="flex justify-between py-1.5 border-b border-zinc-200">
                  <span className="text-zinc-600">Huấn luyện viên:</span>
                  <span className="font-semibold text-zinc-900">{classDetail.trainerName || "Chưa có"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-200">
                  <span className="text-zinc-600">Thời gian:</span>
                  <span className="font-semibold text-zinc-900">
                    {format(new Date(classDetail.scheduledAt), 'dd/MM/yyyy, hh:mm a')}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-200">
                  <span className="text-zinc-600">Thời lượng:</span>
                  <span className="font-semibold text-zinc-900">{classDetail.durationMinutes} phút</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-200">
                  <span className="text-zinc-600">Vị trí:</span>
                  <span className="font-semibold text-zinc-900">{classDetail.location || "Chưa có"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-600">Sức chứa:</span>
                  <span className="font-semibold text-zinc-900">
                    {classDetail.enrolledCount} / {classDetail.capacity} học viên
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-red-500">Không tìm thấy thông tin lớp học.</div>
          )}

          <DialogFooter className="sm:justify-end">
            <Button onClick={() => setSelectedClassId(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

