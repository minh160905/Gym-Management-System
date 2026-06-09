import { useListAttendance, useListMembers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarCheck2, Users, Clock } from "lucide-react";

export default function ManagerAttendance() {
  const { data: attendance, isLoading: attendanceLoading } = useListAttendance();
  const { data: members, isLoading: membersLoading } = useListMembers();

  const isLoading = attendanceLoading || membersLoading;

  // Bản đồ ánh xạ ID hội viên -> Gói hội viên
  const memberPlanMap = new Map<number, string>();
  members?.forEach(m => {
    memberPlanMap.set(m.id, m.status === 'expired' ? '—' : (m.membershipPlanName || "Chưa có gói"));
  });

  // Tính số lượng checkin trong ngày hôm nay (theo giờ local của server/client)
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayCheckins = attendance?.filter(record => {
    try {
      const recordDateStr = format(new Date(record.checkedInAt), "yyyy-MM-dd");
      return recordDateStr === todayStr;
    } catch {
      return false;
    }
  }) || [];
  const todayCount = todayCheckins.length;

  // Lượt checkin đang hoạt động (chưa checkout)
  const activeCount = attendance?.filter(r => !r.checkedOutAt).length || 0;

  // Sắp xếp danh sách check-in mới nhất lên đầu
  const sortedAttendance = attendance
    ? [...attendance].sort((a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime())
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">Nhật ký điểm danh</h1>
        <p className="text-muted-foreground mt-2">Theo dõi check-in và chấm công hội viên.</p>
      </div>

      {/* Thẻ thống kê */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-black">Tổng số lượt check-in hôm nay</CardTitle>
            <CalendarCheck2 className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{todayCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Lượt quét QR check-in thành công ghi nhận trong ngày</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-black">Hội viên đang ở phòng tập</CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Tổng số hội viên hiện tại chưa thực hiện check-out</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Bảng Nhật ký điểm danh chính */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-black font-bold">Lịch sử điểm danh</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-black font-semibold">Hội viên</TableHead>
                  <TableHead className="text-black font-semibold">Gói hội viên</TableHead>
                  <TableHead className="text-black font-semibold">Lớp học</TableHead>
                  <TableHead className="text-black font-semibold">Check In</TableHead>
                  <TableHead className="text-black font-semibold">Check Out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Đang tải...</TableCell></TableRow>
                ) : attendance?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Chưa có dữ liệu điểm danh.</TableCell></TableRow>
                ) : attendance?.map((record) => {
                  const planName = memberPlanMap.get(record.memberId) || "Chưa có gói";
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium text-black">{record.memberName}</TableCell>
                      <TableCell>
                        <Badge variant={planName === "—" || planName === "Chưa có gói" ? "secondary" : "default"} className="text-xs font-normal">
                          {planName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{record.className || '-'}</TableCell>
                      <TableCell className="text-black">{format(new Date(record.checkedInAt), 'dd/MM/yyyy · HH:mm')}</TableCell>
                      <TableCell className="text-muted-foreground">{record.checkedOutAt ? format(new Date(record.checkedOutAt), 'dd/MM/yyyy · HH:mm') : '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sidebar Check-in gần đây */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-black">Check-in Gần Đây</CardTitle>
            <CardDescription>Danh sách 5 hội viên check-in mới nhất</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-6">Đang tải...</p>
            ) : sortedAttendance.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Chưa có lượt check-in nào.</p>
            ) : (
              sortedAttendance.slice(0, 5).map((record) => {
                const planName = memberPlanMap.get(record.memberId) || "Chưa có gói";
                return (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors bg-white">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-black">{record.memberName}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{format(new Date(record.checkedInAt), "HH:mm")} · {format(new Date(record.checkedInAt), "dd/MM")}</span>
                      </div>
                    </div>
                    <Badge variant={planName === "—" || planName === "Chưa có gói" ? "secondary" : "default"} className="text-xs font-normal shrink-0">
                      {planName}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
