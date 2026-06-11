import { useState } from "react";
import { useListPayments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";
import {
  DollarSign, Clock, CheckCircle2, Receipt,
  CreditCard, Landmark, Printer
} from "lucide-react";
import type { Payment } from "@workspace/api-client-react";

type FilterStatus = "all" | "paid" | "pending" | "failed";

const FILTERS: { id: FilterStatus; label: string }[] = [
  { id: "all",     label: "Tất cả" },
  { id: "paid",    label: "Đã thanh toán" },
  { id: "pending", label: "Chờ xử lý" },
  { id: "failed",  label: "Thất bại" },
];

function formatMethod(method: string | null | undefined) {
  if (!method) return "—";
  if (method === "bank_transfer") return "Chuyển khoản";
  if (method === "credit_card") return "Thẻ tín dụng";
  return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function MethodIcon({ method }: { method: string | null | undefined }) {
  if (method === "bank_transfer") return <Landmark className="w-3.5 h-3.5 inline-block mr-1 text-muted-foreground" />;
  if (method === "credit_card")   return <CreditCard className="w-3.5 h-3.5 inline-block mr-1 text-muted-foreground" />;
  return null;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "paid":    return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Thành công</Badge>;
    case "pending": return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-400/30">Chờ xử lý</Badge>;
    case "failed":  return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Thất bại</Badge>;
    default:        return <Badge variant="outline">{status}</Badge>;
  }
}

function ReceiptDialog({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const refNumber = `IRF-${String(payment.id).padStart(6, "0")}`;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            Hóa đơn thanh toán
          </DialogTitle>
        </DialogHeader>

        {/* Receipt body */}
        <div className="space-y-4 py-2">
          {/* Header */}
          <div className="text-center space-y-0.5 pb-2">
            <p className="font-black text-lg tracking-tight">IRON <span className="text-primary">&amp;</span> FORGE</p>
            <p className="text-xs text-muted-foreground">Biên lai thanh toán chính thức</p>
          </div>

          <Separator />

          {/* Ref + date */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mã hóa đơn.</span>
              <span className="font-mono font-semibold">{refNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngày thanh toán</span>
              <span>{format(new Date(payment.paymentDate), "dd/MM/yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phương thức</span>
              <span className="flex items-center gap-1">
                <MethodIcon method={payment.paymentMethod} />
                {formatMethod(payment.paymentMethod)}
              </span>
            </div>
            {payment.membershipPlanName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gói tập</span>
                <span>{payment.membershipPlanName}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div className="text-sm">
            <p className="text-muted-foreground text-xs mb-1 uppercase tracking-wide">Mô tả</p>
            <p className="font-medium">{payment.description}</p>
          </div>

          <Separator />

          {/* Amount + status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Trạng thái</p>
              <StatusBadge status={payment.status} />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Số tiền</p>
              <p className="text-2xl font-bold text-primary">${payment.amount.toFixed(2)}</p>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-1 border-t border-dashed border-border">
            Cảm ơn quý khách đã thanh toán.
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-3.5 h-3.5 mr-1.5" /> In hóa đơn
          </Button>
          <Button onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomerPayments() {
  const { memberId } = useAuth();
  const { data: payments, isLoading } = useListPayments({ memberId });
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

  const filtered = payments?.filter((p) => filter === "all" || p.status === filter) ?? [];

  const totalPaid    = payments?.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0) ?? 0;
  const totalPending = payments?.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0) ?? 0;
  const lastPayment  = payments?.filter((p) => p.status === "paid").sort((a, b) =>
    new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  )[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lịch sử thanh toán</h1>
        <p className="text-muted-foreground mt-2">Xem và quản lý tất cả các giao dịch thanh toán của bạn.</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Tổng số đã thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalPaid.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {payments?.filter((p) => p.status === "paid").length ?? 0} giao dịch
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" /> Số dư chờ xử lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalPending.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {payments?.filter((p) => p.status === "pending").length ?? 0} giao dịch chưa hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" /> Thanh toán gần nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastPayment ? (
              <>
                <p className="text-2xl font-bold">${lastPayment.amount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(lastPayment.paymentDate), "dd/MM/yyyy")}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>Danh sách giao dịch</CardTitle>
            {/* Status filter */}
            <div className="flex items-center gap-1 rounded-lg border border-border p-1">
              {FILTERS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày giao dịch</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Biên lai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Đang tải...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Không tìm thấy giao dịch nào.
                  </TableCell>
                </TableRow>
              ) : filtered.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(new Date(payment.paymentDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-sm">{payment.description}</p>
                    {payment.membershipPlanName && (
                      <p className="text-xs text-muted-foreground">Gói {payment.membershipPlanName}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="flex items-center">
                      <MethodIcon method={payment.paymentMethod} />
                      {formatMethod(payment.paymentMethod)}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">${payment.amount.toFixed(2)}</TableCell>
                  <TableCell><StatusBadge status={payment.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary"
                      onClick={() => setReceiptPayment(payment)}
                    >
                      <Receipt className="w-3.5 h-3.5 mr-1.5" /> Xem biên lai
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {receiptPayment && (
        <ReceiptDialog payment={receiptPayment} onClose={() => setReceiptPayment(null)} />
      )}
    </div>
  );
}
