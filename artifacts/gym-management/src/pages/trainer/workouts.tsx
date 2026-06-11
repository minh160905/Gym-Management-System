import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useListPTRequests, useListSessions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Dumbbell, Calendar, Clock, MessageSquare, ShieldAlert } from "lucide-react";

// Helper function to calculate end date from duration string (e.g. "1 năm", "6 tháng", "12 tuần")
function getEndDate(startDate: Date, durationStr: string | null): Date {
  if (!durationStr) return startDate;
  const date = new Date(startDate);
  const cleanStr = durationStr.toLowerCase().trim();
  
  const match = cleanStr.match(/^(\d+)\s*(.*)$/);
  if (match) {
    const num = parseInt(match[1]);
    const unit = match[2];
    if (unit.includes("năm") || unit.includes("year") || unit === "y") {
      date.setFullYear(date.getFullYear() + num);
    } else if (unit.includes("tháng") || unit.includes("month") || unit === "m") {
      date.setMonth(date.getMonth() + num);
    } else if (unit.includes("tuần") || unit.includes("week") || unit === "w") {
      date.setDate(date.getDate() + num * 7);
    } else if (unit.includes("ngày") || unit.includes("day") || unit === "d") {
      date.setDate(date.getDate() + num);
    } else {
      date.setMonth(date.getMonth() + num);
    }
  } else {
    if (cleanStr.includes("năm") || cleanStr.includes("year")) {
      date.setFullYear(date.getFullYear() + 1);
    } else if (cleanStr.includes("tháng") || cleanStr.includes("month")) {
      date.setMonth(date.getMonth() + 1);
    } else if (cleanStr.includes("tuần") || cleanStr.includes("week")) {
      date.setDate(date.getDate() + 7);
    }
  }
  return date;
}

export default function TrainerWorkouts() {
  const { staffId } = useAuth();
  
  // Fetch personal training requests/contracts for this trainer
  const { data: ptRequests, isLoading: ptLoading } = useListPTRequests({ trainerId: staffId });
  
  // Fetch all sessions for this trainer to count completed sessions
  const { data: sessions, isLoading: sessionsLoading } = useListSessions({ trainerId: staffId });

  const [selectedContract, setSelectedContract] = useState<any | null>(null);

  const isLoading = ptLoading || sessionsLoading;

  // Filter only active personal training contracts
  const activeContracts = ptRequests?.filter(r => r.status === "confirm" || r.status === "approved") || [];

  const handleOpenDetail = (contract: any) => {
    setSelectedContract(contract);
  };

  const getContractSessions = (memberId: number) => {
    return sessions?.filter(s => s.memberId === memberId) || [];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">Hợp đồng tập luyện cá nhân</h1>
        <p className="text-muted-foreground mt-2">Xem thông tin khách hàng và theo dõi số lượng buổi tập PT còn lại.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
        ) : activeContracts.length === 0 ? (
          <Card className="col-span-full border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
            <Dumbbell className="w-10 h-10 text-muted-foreground/60 mb-3" />
            <p className="font-semibold text-zinc-500">Chưa có hợp đồng PT cá nhân nào được kích hoạt.</p>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">Khi bạn chấp nhận yêu cầu của khách hàng, hợp đồng tập luyện sẽ hiển thị ở đây.</p>
          </Card>
        ) : (
          activeContracts.map((contract) => {
            const clientSessions = getContractSessions(contract.memberId);
            const completedCount = clientSessions.filter(s => s.status === "completed").length;
            const totalSessions = contract.sessionsCount ?? 0;
            const remainingSessions = Math.max(0, totalSessions - completedCount);
            
            const startDate = new Date(contract.updatedAt);
            const endDate = getEndDate(startDate, contract.desiredDuration || null);
            const percentRemaining = totalSessions > 0 ? (remainingSessions / totalSessions) * 100 : 0;

            return (
              <Card key={contract.id} className="border-border hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-black">{contract.memberName}</CardTitle>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Đang hoạt động</Badge>
                  </div>
                  <CardDescription>Hợp đồng PT cá nhân</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Mục tiêu / Lời nhắn</span>
                    <div className="text-sm font-medium text-black mt-1 line-clamp-3" title={contract.message || ''}>
                      {contract.message || 'Không có mô tả chi tiết.'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <span>Số buổi còn lại</span>
                      <span className="text-black font-bold normal-case">{remainingSessions} / {totalSessions} buổi</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentRemaining}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Thời hạn hợp đồng</span>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-black mt-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{format(startDate, 'dd/MM/yyyy')} - {format(endDate, 'dd/MM/yyyy')}</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5 block">Thời gian mong muốn: {contract.desiredDuration || 'Chưa thiết lập'}</span>
                  </div>
                </CardContent>
                <div className="p-6 pt-0 border-t border-zinc-100 mt-4">
                  <Button variant="outline" className="w-full mt-4" onClick={() => handleOpenDetail(contract)}>Xem chi tiết</Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedContract} onOpenChange={(open) => !open && setSelectedContract(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lịch sử buổi tập - {selectedContract?.memberName}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-lg border border-border">
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-medium">Mục tiêu</span>
                <span className="text-sm font-semibold text-black">{selectedContract?.message || "Không có"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block uppercase font-medium">Thời hạn hợp đồng</span>
                <span className="text-sm font-semibold text-black">
                  {selectedContract && `${format(new Date(selectedContract.updatedAt), 'dd/MM/yyyy')} đến ${format(getEndDate(new Date(selectedContract.updatedAt), selectedContract.desiredDuration), 'dd/MM/yyyy')}`}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-bold text-black block">Danh sách các buổi tập PT</span>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Thời lượng</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedContract && getContractSessions(selectedContract.memberId).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          Chưa có buổi tập PT nào được thiết lập.
                        </TableCell>
                      </TableRow>
                    ) : selectedContract && getContractSessions(selectedContract.memberId).map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{format(new Date(session.scheduledAt), 'dd/MM/yyyy · HH:mm')}</TableCell>
                        <TableCell>{session.durationMinutes} phút</TableCell>
                        <TableCell>{session.location || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                            {session.status === "completed" ? "Hoàn thành" : "Đã lên lịch"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSelectedContract(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
