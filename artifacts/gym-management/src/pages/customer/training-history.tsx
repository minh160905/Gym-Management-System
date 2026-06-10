import { useGetMemberTrainingHistory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";

export default function CustomerTrainingHistory() {
  const { memberId } = useAuth();
  // Ensure we pass a valid number to the hook; if memberId is null, pass 0 (it will be disabled by the hook if configured)
  const { data: history, isLoading } = useGetMemberTrainingHistory(memberId || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lịch sử tập luyện</h1>
        <p className="text-muted-foreground mt-2">Xem các lớp học và buổi tập PT trước đây của bạn.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Loại hình</TableHead>
                <TableHead>Tên lớp/Buổi tập</TableHead>
                <TableHead>Huấn luyện viên</TableHead>
                <TableHead>Thời lượng</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Đang tải...</TableCell></TableRow>
              ) : history?.items?.map(item => (
                <TableRow key={`${item.type}-${item.id}`}>
                  <TableCell className="whitespace-nowrap">{format(new Date(item.scheduledAt), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell>
                    <Badge variant={item.type === "class" ? "default" : "secondary"}>
                      {item.type === "class" ? "Lớp học" : "PT Cá nhân"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.trainerName || "-"}</TableCell>
                  <TableCell>{item.durationMinutes ? `${item.durationMinutes} phút` : "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.status === "completed" ? "Hoàn thành" : (item.status === "scheduled" ? "Đã lên lịch" : (item.status === "cancelled" ? "Đã hủy" : item.status))}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {history?.items?.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Không tìm thấy lịch sử tập luyện.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
