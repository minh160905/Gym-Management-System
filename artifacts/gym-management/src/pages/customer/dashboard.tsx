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
  const { memberId, fullName } = useAuth();
  const { data: bookings = [], isLoading: bookingsLoading } = useListBookings({ memberId: memberId ?? undefined }, { query: { refetchInterval: 3000 } as any });
  const { data: attendance = [], isLoading: attendanceLoading } = useListAttendance({ memberId: memberId ?? undefined }, { query: { refetchInterval: 3000 } as any });
  const { data: sessions = [], isLoading: sessionsLoading } = useListSessions({ memberId: memberId ?? undefined }, { query: { refetchInterval: 3000 } as any });

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  // Fetch class details for dialog
  const { data: classDetail, isLoading: classLoading } = useGetClass(selectedClassId ?? 0, {
    query: { enabled: !!selectedClassId } as any
  });

  // Thống kê điều chỉnh cho tài khoản demo Customer theo yêu cầu và cập nhật real time:
  const isDemo = fullName === "Customer";
  const checkInDaysCount = (isDemo ? 201 : 0) + attendance.length;
  const classesJoinedCount = (isDemo ? 56 : 0) + bookings.filter(b => b.status === "confirmed").length;
  const completedSessionsCount = (isDemo ? 25 : 0) + sessions.filter(s => s.status === "completed").length;

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
        <div className="pastel-card pastel-emerald p-5 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-black">Tổng số ngày đã Check in</span>
            <div className="p-2 rounded-lg border border-black/10 bg-emerald-600/20 text-black">
              <CalendarCheck2 className="w-5 h-5 ignore-color" />
            </div>
          </div>
          <div className="relative z-10 mt-1">
            <div className="text-3xl font-black text-black tracking-tight">
              {attendanceLoading ? "..." : checkInDaysCount}
            </div>
            <p className="text-xs font-bold text-black mt-1">Ngày luyện tập tại phòng gym</p>
          </div>
        </div>

        <div className="pastel-card pastel-sky p-5 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-black">Số lớp học đã tham gia</span>
            <div className="p-2 rounded-lg border border-black/10 bg-sky-600/20 text-black">
              <Activity className="w-5 h-5 ignore-color" />
            </div>
          </div>
          <div className="relative z-10 mt-1">
            <div className="text-3xl font-black text-black tracking-tight">
              {bookingsLoading ? "..." : classesJoinedCount}
            </div>
            <p className="text-xs font-bold text-black mt-1">Lớp học thể dục nhóm đã xác nhận</p>
          </div>
        </div>

        <div className="pastel-card pastel-amber p-5 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-black">Số sessions đã hoàn thành</span>
            <div className="p-2 rounded-lg border border-black/10 bg-amber-600/20 text-black">
              <Dumbbell className="w-5 h-5 ignore-color" />
            </div>
          </div>
          <div className="relative z-10 mt-1">
            <div className="text-3xl font-black text-black tracking-tight">
              {sessionsLoading ? "..." : completedSessionsCount}
            </div>
            <p className="text-xs font-bold text-black mt-1">Buổi tập riêng với HLV cá nhân</p>
          </div>
        </div>
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

