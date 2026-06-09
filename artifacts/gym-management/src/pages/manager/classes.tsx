import { useState } from "react";
import {
  useListClasses,
  useCreateClass,
  useListStaff,
  getListClassesQueryKey,
  useListBookings,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const EMPTY_FORM = {
  name: "",
  description: "",
  trainerId: "none",
  capacity: "20",
  scheduledAt: "",
  endDate: "",
  durationMinutes: "45",
  location: "",
  category: "yoga",
  status: "scheduled",
};

export default function ManagerClasses() {
  const { data: classes, isLoading } = useListClasses();
  const { data: staff = [] } = useListStaff({ role: "trainer" });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createClassMutation = useCreateClass();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
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

  function openAdd() {
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.scheduledAt || !form.endDate || !form.category.trim()) {
      toast({
        title: "Lỗi xác thực",
        description: "Tên lớp học, danh mục, ngày bắt đầu và ngày kết thúc là bắt buộc.",
        variant: "destructive",
      });
      return;
    }

    const startD = new Date(form.scheduledAt);
    const endD = new Date(form.endDate);
    if (endD < startD) {
      toast({
        title: "Lỗi xác thực",
        description: "Ngày kết thúc phải sau ngày bắt đầu.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      trainerId: form.trainerId === "none" ? null : parseInt(form.trainerId),
      capacity: parseInt(form.capacity) || 20,
      scheduledAt: startD.toISOString(),
      endDate: endD.toISOString(),
      durationMinutes: parseInt(form.durationMinutes) || 45,
      location: form.location.trim() || null,
      category: form.category,
      status: form.status,
    };

    try {
      await createClassMutation.mutateAsync({ data: payload });
      toast({
        title: "Đã thêm lớp học",
        description: `Lớp học "${payload.name}" đã được tạo thành công.`,
      });
      queryClient.invalidateQueries({ queryKey: getListClassesQueryKey() });
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo lớp học mới.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch lớp học</h1>
          <p className="text-muted-foreground mt-2">Quản lý các lớp học thể dục và sức chứa.</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm lớp học
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lớp học</TableHead>
                <TableHead>HLV</TableHead>
                <TableHead>Lịch học</TableHead>
                <TableHead>Sức chứa</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Học viên</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : classes?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy lớp học nào.
                  </TableCell>
                </TableRow>
              ) : (
                classes?.map((cls) => {
                  const schedInfo = getWeeklyScheduleText(cls.scheduledAt, cls.endDate);
                  return (
                    <TableRow key={cls.id}>
                      <TableCell>
                        <div className="font-medium">{cls.name}</div>
                        <div className="text-sm text-muted-foreground">{cls.category}</div>
                      </TableCell>
                      <TableCell>{cls.trainerName || "Chưa phân công"}</TableCell>
                      <TableCell>
                        <div className="font-medium text-zinc-900">{schedInfo.schedule}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Bắt đầu: {schedInfo.start} - Kết thúc: {schedInfo.end} ({cls.durationMinutes} phút)
                        </div>
                      </TableCell>
                      <TableCell>
                        {cls.enrolledCount} / {cls.capacity}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cls.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setViewingClassId(cls.id);
                            setViewingClassName(cls.name);
                          }}
                        >
                          Xem danh sách
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

      {/* Add Class Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm lớp học mới</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Tên lớp học <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Ví dụ: Yoga Sáng Khỏe, Cardio Hỏa Lực..."
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Mô tả lớp học</Label>
              <Textarea
                placeholder="Mô tả tóm tắt nội dung bài học..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Huấn luyện viên</Label>
                <Select
                  value={form.trainerId}
                  onValueChange={(v) => setForm((f) => ({ ...f, trainerId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không phân công</SelectItem>
                    {staff.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.firstName} {t.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Danh mục <span className="text-destructive">*</span></Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="hiit">Cardio HIIT</SelectItem>
                    <SelectItem value="strength">Tập thể lực (Strength)</SelectItem>
                    <SelectItem value="pilates">Pilates</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="crossfit">CrossFit</SelectItem>
                    <SelectItem value="flexibility">Giãn cơ (Flexibility)</SelectItem>
                    <SelectItem value="weight-loss">Giảm cân (Weight Loss)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày bắt đầu & Giờ <span className="text-destructive">*</span></Label>
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Ngày kết thúc <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Thời lượng (phút)</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.durationMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Vị trí phòng học</Label>
                <Input
                  placeholder="Ví dụ: Phòng Yoga Tầng 2, Khu A..."
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Trạng thái</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sức chứa tối đa</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang tạo..." : "Tạo lớp học"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

