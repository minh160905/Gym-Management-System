import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useListSessions, useListClasses, useGetStaff } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { DollarSign, Calendar, Printer, FileText, CheckCircle2, Award, Briefcase, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function TrainerIncomeDetails() {
  const { staffId } = useAuth();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [isSlipOpen, setIsSlipOpen] = useState<boolean>(false);

  // Fetch data
  const { data: sessions = [], isLoading: sessionsLoading } = useListSessions({ 
    trainerId: staffId ?? undefined 
  });
  const { data: classes = [], isLoading: classesLoading } = useListClasses({ 
    trainerId: staffId ?? undefined 
  });
  const { data: trainerInfo } = useGetStaff(staffId ?? 0, { 
    query: { enabled: !!staffId } 
  });

  const baseSalary = trainerInfo?.salary ? parseFloat(String(trainerInfo.salary)) : 0;
  const isLoading = sessionsLoading || classesLoading;

  // Filter completed sessions and group by month
  const completedSessions = useMemo(() => {
    return sessions.filter(s => s.status === "completed");
  }, [sessions]);

  // Extract unique months from sessions (both completed and scheduled) to populate select list dynamically
  const uniqueMonths = useMemo(() => {
    const months = new Set<string>();
    sessions.forEach(s => {
      try {
        const date = new Date(s.scheduledAt);
        if (!isNaN(date.getTime())) {
          months.add(format(date, "yyyy-MM"));
        }
      } catch (e) {
        // ignore invalid dates
      }
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [sessions]);

  // Map month key (yyyy-MM) to Vietnamese display name (Tháng MM/yyyy)
  const formatMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    return `Tháng ${month}/${year}`;
  };

  // Filter sessions and classes by selected month
  const filteredSessions = useMemo(() => {
    if (selectedMonth === "all") {
      return completedSessions;
    }
    return completedSessions.filter(s => {
      try {
        const date = new Date(s.scheduledAt);
        return format(date, "yyyy-MM") === selectedMonth;
      } catch (e) {
        return false;
      }
    });
  }, [completedSessions, selectedMonth]);

  const filteredClasses = useMemo(() => {
    if (selectedMonth === "all") {
      return classes;
    }
    return classes.filter(c => {
      try {
        // Assume class date exists and is formatable
        if (c.scheduledAt) {
          const date = new Date(c.scheduledAt);
          return format(date, "yyyy-MM") === selectedMonth;
        }
        return false;
      } catch (e) {
        return false;
      }
    });
  }, [classes, selectedMonth]);

  // Income calculations
  const ptSessionCount = filteredSessions.length;
  const extraIncome = ptSessionCount * 25;
  // If "all" is selected, we show monthly base salary + total all-time commission
  const totalIncome = baseSalary + extraIncome;

  // Percentage breakdown for visualization
  const salaryPercentage = totalIncome > 0 ? Math.round((baseSalary / totalIncome) * 100) : 100;
  const extraPercentage = totalIncome > 0 ? Math.round((extraIncome / totalIncome) * 100) : 0;

  const handlePrintSlip = () => {
    toast({
      title: "In phiếu lương thành công",
      description: "Đã gửi yêu cầu in phiếu lương tới máy in hệ thống.",
    });
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Chi tiết thu nhập HLV</h1>
          <p className="text-muted-foreground mt-1">Theo dõi bảng lương cơ bản, các khoản thưởng session và chi tiết thanh toán.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Chọn tháng:</span>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px] bg-background border-border">
                <SelectValue placeholder="Tất cả thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thời gian</SelectItem>
                {uniqueMonths.map(month => (
                  <SelectItem key={month} value={month}>
                    {formatMonthName(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isSlipOpen} onOpenChange={setIsSlipOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-200">
                <FileText className="w-4 h-4" />
                Xem Phiếu Lương
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white text-zinc-900 border border-zinc-200 shadow-2xl p-8 rounded-xl">
              <DialogHeader className="border-b border-zinc-100 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900">PHIẾU CHI TRẢ THU NHẬP</DialogTitle>
                    <p className="text-xs text-zinc-500 mt-1">IRON & FORGE GYM - FITNESS CENTER</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="border-zinc-300 text-zinc-700 font-semibold px-2.5 py-0.5">
                      {selectedMonth === "all" ? "Tất cả thời gian" : formatMonthName(selectedMonth)}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              {/* Pay slip details */}
              <div className="py-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm border-b border-zinc-100 pb-4">
                  <div>
                    <p className="text-zinc-500">Họ và tên nhân viên:</p>
                    <p className="font-semibold text-zinc-800">{trainerInfo ? `${trainerInfo.firstName} ${trainerInfo.lastName}` : "HLV Jordan"}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Mã nhân viên (ID):</p>
                    <p className="font-mono font-semibold text-zinc-800">#{staffId ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Chức vụ / Vai trò:</p>
                    <p className="font-semibold text-zinc-800">Huấn luyện viên cá nhân (PT)</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Ngày tạo phiếu:</p>
                    <p className="font-semibold text-zinc-800">{format(new Date(), "dd/MM/yyyy")}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-800 mb-3 text-sm uppercase tracking-wide">Chi tiết các khoản thu nhập</h4>
                  <Table className="border border-zinc-100 rounded-lg overflow-hidden">
                    <TableHeader className="bg-zinc-50">
                      <TableRow className="border-b border-zinc-200">
                        <TableHead className="text-zinc-700 font-semibold">Khoản mục</TableHead>
                        <TableHead className="text-zinc-700 font-semibold text-right">Chi tiết tính</TableHead>
                        <TableHead className="text-zinc-700 font-semibold text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-b border-zinc-100">
                        <TableCell className="font-medium text-zinc-800">Lương cứng cơ bản</TableCell>
                        <TableCell className="text-right text-zinc-500">Mức lương cố định</TableCell>
                        <TableCell className="text-right font-semibold text-zinc-800">${baseSalary.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow className="border-b border-zinc-100">
                        <TableCell className="font-medium text-zinc-800">Hoa hồng dạy PT</TableCell>
                        <TableCell className="text-right text-zinc-500">{ptSessionCount} session hoàn thành × $25/ses</TableCell>
                        <TableCell className="text-right font-semibold text-zinc-800">${extraIncome.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow className="bg-zinc-50/50">
                        <TableCell className="font-bold text-zinc-950">TỔNG CỘNG THỰC NHẬN</TableCell>
                        <TableCell className="text-right text-zinc-500 font-medium"></TableCell>
                        <TableCell className="text-right font-extrabold text-emerald-600 text-lg">${totalIncome.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-zinc-500 pt-6 border-t border-zinc-100">
                  <div className="text-center">
                    <p className="font-medium mb-12">Người nhận thanh toán</p>
                    <p className="italic text-zinc-400">(Ký và ghi rõ họ tên)</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium mb-12">Bộ phận kế toán / Xác nhận</p>
                    <p className="italic text-zinc-400">(Ký và đóng dấu)</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-zinc-100 pt-4 flex sm:justify-between items-center w-full">
                <p className="text-xs text-zinc-400">Phiếu lương tự động sinh bởi hệ thống Iron & Forge.</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsSlipOpen(false)} className="border-zinc-300 text-zinc-700 hover:bg-zinc-50">
                    Đóng
                  </Button>
                  <Button onClick={handlePrintSlip} className="bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    In phiếu lương
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Lương cứng cơ bản</CardTitle>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              ${baseSalary.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Hợp đồng lao động cố định hàng tháng</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Hoa hồng dạy PT</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Award className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              ${extraIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tính theo: {ptSessionCount} session hoàn thành × $25</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-emerald-200 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Tổng thu nhập dự tính</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80 mt-1">Lương cứng cơ bản + Thưởng hoàn thành</p>
          </CardContent>
        </Card>
      </div>

      {/* Income breakdown visualization */}
      <Card className="border border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Cơ cấu cấu thành thu nhập
          </CardTitle>
          <CardDescription>Biểu đồ trực quan tỷ lệ đóng góp từ lương cứng cơ bản và hoa hồng PT cá nhân.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500 block" />
                Lương cứng cơ bản ({salaryPercentage}%)
              </span>
              <span className="text-amber-600 dark:text-amber-500 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 block" />
                Hoa hồng dạy PT ({extraPercentage}%)
              </span>
            </div>
            {/* Horizontal progress bar */}
            <div className="w-full h-5 rounded-full overflow-hidden flex bg-zinc-100 dark:bg-zinc-800">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-500"
                style={{ width: `${salaryPercentage}%` }}
              />
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                style={{ width: `${extraPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="text-muted-foreground font-medium">Buổi PT đã dạy hoàn thành:</p>
              <p className="text-2xl font-bold mt-1 text-zinc-800 dark:text-zinc-200">{ptSessionCount} buổi</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Lớp học nhóm phụ trách:</p>
              <p className="text-2xl font-bold mt-1 text-zinc-800 dark:text-zinc-200">{filteredClasses.length} lớp học</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed PT Sessions Breakdown Table */}
      <Card className="border border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Chi tiết danh sách buổi PT hoàn thành</CardTitle>
          <CardDescription>Các buổi huấn luyện cá nhân đã dạy thành công trong kỳ thanh toán.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-zinc-200 dark:border-zinc-800">
                <TableHead>Khách hàng (Học viên)</TableHead>
                <TableHead>Ngày & Giờ dạy</TableHead>
                <TableHead>Thời lượng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hoa hồng nhận</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Đang tải danh sách...
                  </TableCell>
                </TableRow>
              ) : filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Không có buổi tập hoàn thành nào trong tháng này.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => (
                  <TableRow key={session.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">{session.memberName || "Khách hàng"}</TableCell>
                    <TableCell className="text-zinc-700 dark:text-zinc-300">
                      {format(new Date(session.scheduledAt), 'dd/MM/yyyy, hh:mm a')}
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">{session.durationMinutes} phút</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Hoàn thành
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">+$25.00</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
