import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { 
  useListBookings, 
  useDeleteBooking, 
  useGetClass, 
  getListBookingsQueryKey 
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function CustomerBookings() {
  const { memberId } = useAuth();
  const { data: bookings = [], isLoading } = useListBookings({ memberId: memberId ?? undefined });
  const deleteBookingMutation = useDeleteBooking();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Fetch class details for dialog
  const { data: classDetail, isLoading: classLoading } = useGetClass(selectedClassId ?? 0, {
    query: { enabled: !!selectedClassId } as any
  });

  // Limit bookings count to show only the first 3 for a tidier screen
  const displayedBookings = bookings.slice(0, 3);

  async function handleCancel(bookingId: number) {
    setCancellingId(bookingId);
    try {
      await deleteBookingMutation.mutateAsync({ id: bookingId });
      toast({
        title: "Đã hủy đặt chỗ",
        description: "Yêu cầu hủy đăng ký lớp học của bạn đã được thực hiện.",
      });
      queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể hủy đăng ký lớp học.",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Danh sách đặt chỗ</h1>
        <p className="text-muted-foreground mt-2">Quản lý các lượt đăng ký lớp học của bạn.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lớp học</TableHead>
                <TableHead>Ngày đăng ký</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : displayedBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
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
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={booking.status === 'cancelled' || cancellingId === booking.id}
                        onClick={() => handleCancel(booking.id)}
                      >
                        {cancellingId === booking.id ? "Đang hủy..." : "Hủy đăng ký"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {bookings.length > 3 && (
            <div className="px-4 py-3 border-t text-xs text-muted-foreground">
              Hiển thị 3 / {bookings.length} lượt đặt chỗ gần nhất để màn hình gọn gàng hơn
            </div>
          )}
        </CardContent>
      </Card>

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
