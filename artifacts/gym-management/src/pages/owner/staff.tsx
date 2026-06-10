import { useState } from "react";
import { useListStaff } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye } from "lucide-react";
import { format } from "date-fns";
import { TrainerDetailDialog } from "@/components/trainer-detail-dialog";
import { CreateStaffDialog } from "@/components/create-staff-dialog";

function roleBadge(role: string) {
  switch (role) {
    case "trainer":        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">HLV Cá nhân</Badge>;
    case "manager":        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-400/30">Quản lý</Badge>;
    case "receptionist":   return <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-400/30">Lễ tân</Badge>;
    case "cleaning_staff": return <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-400/30">Vệ sinh</Badge>;
    case "maintenance":    return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-400/30">Bảo trì</Badge>;
    default:               return <Badge variant="outline" className="capitalize">{role.replace(/_/g, " ")}</Badge>;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "active":   return <Badge variant="default">Hoạt động</Badge>;
    case "inactive": return <Badge variant="secondary">Ngừng</Badge>;
    case "on_leave": return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-400/30">Nghỉ phép</Badge>;
    default:         return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function OwnerStaff() {
  const { data: staff, isLoading } = useListStaff();
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const activeCount  = staff?.filter((s) => s.status === "active").length ?? 0;
  const trainerCount = staff?.filter((s) => s.role === "trainer").length ?? 0;
  const totalSalary  = staff?.filter((s) => s.status !== "inactive").reduce((sum, s) => sum + (s.salary ? Number(s.salary) : 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Danh sách nhân viên</h1>
          <p className="text-muted-foreground mt-2">Quản lý HLV, quản lý và toàn bộ nhân sự.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Thêm nhân viên
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng nhân viên",       value: staff?.length ?? 0 },
          { label: "Đang làm việc",           value: activeCount },
          { label: "HLV cá nhân",             value: trainerCount },
          { label: "Lương năm (dự kiến)",    value: totalSalary ? `$${totalSalary.toLocaleString()}` : "—" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Ngày tuyển</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Lương</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell></TableRow>
              ) : staff?.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Chưa có nhân viên nào.</TableCell></TableRow>
              ) : staff?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                  <TableCell>{roleBadge(member.role)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.phone ?? "—"}</TableCell>
                  <TableCell className="text-sm">{format(new Date(member.hireDate), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{statusBadge(member.status)}</TableCell>
                  <TableCell className="text-sm">
                    {member.salary ? `$${Number(member.salary).toLocaleString()}/năm` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedStaffId(member.id)}>
                      <Eye className="w-4 h-4 mr-1" /> Xem / Sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TrainerDetailDialog staffId={selectedStaffId} onClose={() => setSelectedStaffId(null)} />
      <CreateStaffDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
