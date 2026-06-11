import { useState } from "react";
import { useListMembers, useListPTRequests, useUpdatePTRequest, getListPTRequestsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { MemberDetailDialog } from "@/components/member-detail-dialog";

export default function TrainerClients() {
  const { staffId } = useAuth();
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const { data: members, isLoading: membersLoading } = useListMembers();
  const { data: ptRequests, isLoading: ptLoading } = useListPTRequests({ trainerId: staffId });
  const updateReq = useUpdatePTRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleUpdateReq = (id: number, status: string) => {
    updateReq.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPTRequestsQueryKey({ trainerId: staffId }) });
        const title = status === "confirm" ? "Đã chấp nhận yêu cầu" : "Đã từ chối yêu cầu";
        toast({ title });
      }
    });
  };

  const confirmedRequests = ptRequests?.filter(r => r.status === "confirm" || r.status === "approved") || [];
  const clientMemberIds = new Set(confirmedRequests.map(r => r.memberId));
  const myClients = members?.filter(m => clientMemberIds.has(m.id)) || [];

  const isLoading = membersLoading || ptLoading;
  const pendingRequests = ptRequests?.filter(r => r.status === "pending") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">Khách hàng của tôi</h1>
        <p className="text-muted-foreground mt-2">Xem tiến độ và thông tin khách hàng được phân công.</p>
      </div>

      {pendingRequests.length > 0 && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-black">Yêu cầu PT đang chờ</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead className="text-black font-semibold">Hội viên</TableHead>
                   <TableHead className="text-black font-semibold">Lời nhắn</TableHead>
                   <TableHead className="text-black font-semibold">Lịch ưa thích</TableHead>
                   <TableHead className="text-black font-semibold">Số buổi</TableHead>
                   <TableHead className="text-black font-semibold">Thời gian mong muốn</TableHead>
                   <TableHead className="text-right text-black font-semibold">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium text-black">{req.memberName}</TableCell>
                    <TableCell className="text-muted-foreground">{req.message || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{req.preferredSchedule || "-"}</TableCell>
                    <TableCell className="text-black font-medium">{req.sessionsCount || "—"} buổi</TableCell>
                    <TableCell className="text-muted-foreground">{req.desiredDuration || "—"}</TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button size="sm" variant="outline" className="text-destructive hover:text-destructive bg-transparent hover:bg-destructive/10" onClick={() => handleUpdateReq(req.id, "Reject")}>
                         <XCircle className="w-4 h-4 mr-1" /> Từ chối
                       </Button>
                       <Button size="sm" onClick={() => handleUpdateReq(req.id, "confirm")} className="text-white">
                         <CheckCircle2 className="w-4 h-4 mr-1" /> Chấp nhận
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Danh sách khách hàng</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mục tiêu</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Đang tải...</TableCell></TableRow>
              ) : myClients.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Chưa có khách hàng đăng ký.</TableCell></TableRow>
              ) : myClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.firstName} {client.lastName}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell className="text-muted-foreground">Chưa thiết lập</TableCell>
                  <TableCell>{format(new Date(client.joinDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedMemberId(client.id)}>
                      <Eye className="w-4 h-4 mr-1" /> Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MemberDetailDialog memberId={selectedMemberId} onClose={() => setSelectedMemberId(null)} />
    </div>
  );
}
