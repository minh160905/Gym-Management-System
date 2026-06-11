import { useListFeedback } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function ManagerFeedback() {
  const { data: feedback, isLoading } = useListFeedback();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Phản hồi</h1>
        <p className="text-muted-foreground mt-2">Xem toàn bộ đánh giá và phản hồi từ hội viên.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Hội viên</TableHead>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Nội dung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Đang tải...</TableCell></TableRow>
              ) : feedback?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">{format(new Date(item.createdAt), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="font-medium">{item.memberName || "Ẩn danh"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {item.serviceType === "general" ? "Chung" :
                       item.serviceType === "classes" ? "Lớp học" :
                       item.serviceType === "personal-training" ? "PT Cá nhân" :
                       item.serviceType === "facilities" ? "Cơ sở vật chất" :
                       item.serviceType === "staff" ? "Nhân viên" : item.serviceType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex text-yellow-500">
                      {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md truncate" title={item.comment}>{item.comment}</TableCell>
                </TableRow>
              ))}
              {feedback?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Chưa có phản hồi nào.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
