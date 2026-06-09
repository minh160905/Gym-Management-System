import { useState } from "react";
import { useListStaff } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { TrainerDetailDialog } from "@/components/trainer-detail-dialog";

function roleBadge(role: string) {
  switch (role) {
    case "trainer":     return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 capitalize">HLV Cá nhân</Badge>;
    case "manager":     return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-400/30 capitalize">Quản lý</Badge>;
    case "receptionist":return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-400/30 capitalize">Lễ tân</Badge>;
    default:            return <Badge variant="outline" className="capitalize">{role}</Badge>;
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

export default function ManagerStaff() {
  const { data: staff, isLoading } = useListStaff();
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nhân viên</h1>
        <p className="text-muted-foreground mt-2">Xem và quản lý thông tin nhân viên.</p>
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
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Đang tải...</TableCell></TableRow>
              ) : staff?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Chưa có nhân viên nào.</TableCell></TableRow>
              ) : staff?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                  <TableCell>{roleBadge(member.role)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.phone ?? "—"}</TableCell>
                  <TableCell className="text-sm">{format(new Date(member.hireDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>{statusBadge(member.status)}</TableCell>
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

      <TrainerDetailDialog
        staffId={selectedStaffId}
        onClose={() => setSelectedStaffId(null)}
      />
    </div>
  );
}
