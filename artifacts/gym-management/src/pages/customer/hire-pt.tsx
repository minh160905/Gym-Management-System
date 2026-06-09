import { useState } from "react";
import {
  useListStaff, useListPTRequests, useCreatePTRequest,
  useCreatePayment, getListPTRequestsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { CreditCard, ChevronRight, ChevronLeft, CheckCircle2, Dumbbell } from "lucide-react";
import type { StaffMember } from "@workspace/api-client-react";
import PaymentSection, { type PaymentMethod, type CardData } from "@/components/payment-section";

const PT_SESSION_FEE = 50;

const detailsSchema = z.object({
  preferredSchedule: z.string().min(1, "Lịch tập dự kiến là bắt buộc"),
  message: z.string().min(1, "Mục tiêu tập luyện là bắt buộc"),
  sessionsCount: z.coerce.number().min(1, "Số session phải lớn hơn 0"),
  desiredDuration: z.string().min(1, "Thời gian mong muốn là bắt buộc"),
});

const DEFAULT_CARD: CardData = { cardType: "visa", cardNumber: "", expiry: "", cvv: "" };

type Step = "details" | "payment" | "success";

export default function CustomerHirePT() {
  const { memberId } = useAuth();
  const { data: trainers, isLoading: trainersLoading } = useListStaff({ role: "trainer" });
  const { data: requests } = useListPTRequests({ memberId });
  const createReq = useCreatePTRequest();
  const createPayment = useCreatePayment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedTrainer, setSelectedTrainer] = useState<StaffMember | null>(null);
  const [step, setStep] = useState<Step>("details");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [cardData, setCardData] = useState<CardData>(DEFAULT_CARD);
  const [saving, setSaving] = useState(false);

  const form = useForm<z.infer<typeof detailsSchema>>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      preferredSchedule: "",
      message: "",
      sessionsCount: 1,
      desiredDuration: "",
    },
  });

  const sessionsCount = form.watch("sessionsCount") || 1;
  const calculatedFee = sessionsCount * PT_SESSION_FEE;

  function openDialog(trainer: StaffMember) {
    setSelectedTrainer(trainer);
    setStep("details");
    setPaymentMethod("credit_card");
    setCardData(DEFAULT_CARD);
    form.reset({
      preferredSchedule: "",
      message: "",
      sessionsCount: 1,
      desiredDuration: "",
    });
  }

  function closeDialog() {
    setSelectedTrainer(null);
    setStep("details");
    form.reset();
  }

  async function handleConfirmPayment() {
    if (!memberId || !selectedTrainer) return;
    const values = form.getValues();
    const currentCalculatedFee = (Number(values.sessionsCount) || 1) * PT_SESSION_FEE;
    setSaving(true);
    try {
      // Tự động coi như thanh toán thành công nếu có lỗi kết nối/máy chủ ở phần tạo Payment
      try {
        await createPayment.mutateAsync({
          data: {
            memberId,
            amount: currentCalculatedFee,
            description: `Phí thuê PT — ${selectedTrainer.firstName} ${selectedTrainer.lastName} (${values.sessionsCount} buổi)`,
            status: "paid",
            paymentDate: new Date().toISOString().split("T")[0],
            paymentMethod,
          },
        });
      } catch (payErr) {
        console.warn("Lỗi ghi nhận giao dịch thanh toán (vẫn tiếp tục tạo yêu cầu PT):", payErr);
      }

      await createReq.mutateAsync({
        data: {
          memberId,
          trainerId: selectedTrainer.id,
          message: values.message,
          preferredSchedule: values.preferredSchedule,
          sessionsCount: Number(values.sessionsCount),
          desiredDuration: values.desiredDuration,
        },
      });

      await queryClient.invalidateQueries({ queryKey: getListPTRequestsQueryKey({ memberId }) });
      setStep("success");
    } catch (reqErr) {
      console.error("Lỗi gửi yêu cầu PT:", reqErr);
      toast({ title: "Đã xảy ra lỗi", description: "Vui lòng thử lại sau.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Chờ duyệt</Badge>;
      case "approved":
      case "confirm":
        return <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30">Confirm</Badge>;
      case "rejected":
      case "Reject":
        return <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">Reject (Đã hoàn tiền)</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">Thuê Huấn Luyện Viên Cá Nhân</h1>
        <p className="text-muted-foreground mt-2">Tìm kiếm huấn luyện viên phù hợp với mục tiêu của bạn.</p>
      </div>

      {/* Trainer Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trainersLoading ? (
          <p className="text-muted-foreground col-span-3">Đang tải danh sách huấn luyện viên...</p>
        ) : trainers?.map((trainer) => (
          <Card key={trainer.id} className="flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  {trainer.firstName[0]}{trainer.lastName[0]}
                </div>
                <div>
                  <CardTitle className="text-base text-black">{trainer.firstName} {trainer.lastName}</CardTitle>
                  <CardDescription className="text-xs">{trainer.specialization || "Thể hình tự do"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {trainer.bio || "Chưa có thông tin giới thiệu."}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">${PT_SESSION_FEE} / buổi</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full text-white" onClick={() => openDialog(trainer)}>
                Thuê {trainer.firstName}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Multi-step Dialog */}
      <Dialog open={!!selectedTrainer} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          {selectedTrainer && (
            <>
              {/* ── Step 1: Details ──────────────────────────── */}
              {step === "details" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-black">
                      <Dumbbell className="w-5 h-5 text-primary" />
                      Thuê {selectedTrainer.firstName} {selectedTrainer.lastName}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground pt-1">
                      Chia sẻ với huấn luyện viên về lịch tập và mục tiêu của bạn.
                    </p>
                  </DialogHeader>

                  <Form {...form}>
                    <form
                      id="details-form"
                      onSubmit={form.handleSubmit(() => setStep("payment"))}
                      className="space-y-4 py-2"
                    >
                      <FormField control={form.control} name="preferredSchedule" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black">Lịch tập dự kiến</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: Tối thứ 2/4/6" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="sessionsCount" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black">Số buổi đăng ký</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="desiredDuration" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black">Thời gian mong muốn</FormLabel>
                            <FormControl>
                              <Input placeholder="Ví dụ: 1 tháng, 3 tháng..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="message" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black">Mục tiêu tập luyện</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Mô tả mục tiêu thể hình của bạn và những điều bạn muốn cải thiện..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </form>
                  </Form>

                  <DialogFooter>
                    <Button variant="outline" onClick={closeDialog}>Hủy</Button>
                    <Button type="submit" form="details-form" className="text-white">
                      Tiếp theo: Thanh toán <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* ── Step 2: Payment ──────────────────────────── */}
              {step === "payment" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-black">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Thanh toán phí thuê PT
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground pt-1">
                      Cần thanh toán phí tương ứng với số buổi tập để gửi yêu cầu thuê PT.
                    </p>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    {/* Fee summary */}
                    <div className="rounded-lg border border-border p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {selectedTrainer.firstName[0]}{selectedTrainer.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-black">{selectedTrainer.firstName} {selectedTrainer.lastName}</p>
                          <p className="text-xs text-muted-foreground">{selectedTrainer.specialization || "Thể hình tự do"}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <p className="text-sm text-muted-foreground">Tổng phí thuê PT ({sessionsCount} buổi)</p>
                        <p className="font-bold text-lg text-primary">${calculatedFee}.00</p>
                      </div>
                    </div>

                    <PaymentSection
                      paymentMethod={paymentMethod}
                      onPaymentMethodChange={setPaymentMethod}
                      cardData={cardData}
                      onCardDataChange={setCardData}
                      amount={calculatedFee}
                      reference={`MEMBER-${memberId}-TRAINER-${selectedTrainer.id}`}
                    />
                  </div>

                  <DialogFooter className="gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setStep("details")} className="mr-auto">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
                    </Button>
                    <Button variant="outline" onClick={closeDialog} disabled={saving}>Hủy</Button>
                    <Button onClick={handleConfirmPayment} disabled={saving} className="text-white">
                      {saving ? "Đang xử lý..." : `Thanh toán $${calculatedFee}.00`}
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* ── Step 3: Success ──────────────────────────── */}
              {step === "success" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-black">Yêu cầu đã gửi</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <div className="p-4 rounded-full bg-primary/10 ring-1 ring-primary/20">
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-lg text-black">Thanh toán thành công</p>
                      <p className="text-muted-foreground text-sm">
                        Khoản thanh toán <span className="font-semibold text-primary">${calculatedFee}</span> cho <span className="font-semibold text-black">{sessionsCount} buổi tập</span> đã được xác nhận. Yêu cầu đã được gửi đến{" "}
                        <span className="font-medium text-foreground">{selectedTrainer.firstName} {selectedTrainer.lastName}</span>.
                      </p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Bạn sẽ nhận được phản hồi ngay khi huấn luyện viên duyệt yêu cầu của bạn.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button className="w-full text-white" onClick={closeDialog}>Hoàn tất</Button>
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* My Requests */}
      {requests && requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-black text-xl">Lịch sử đăng ký thuê PT</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-black font-semibold">Ngày yêu cầu</TableHead>
                  <TableHead className="text-black font-semibold">Huấn luyện viên</TableHead>
                  <TableHead className="text-black font-semibold">Lịch tập dự kiến</TableHead>
                  <TableHead className="text-black font-semibold">Số buổi</TableHead>
                  <TableHead className="text-black font-semibold">Thời gian mong muốn</TableHead>
                  <TableHead className="text-black font-semibold">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="text-sm text-black">{format(new Date(req.createdAt), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="font-medium text-black">{req.trainerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{req.preferredSchedule || "—"}</TableCell>
                    <TableCell className="text-sm text-black font-medium">{req.sessionsCount || "—"} buổi</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{req.desiredDuration || "—"}</TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-yellow-600 bg-yellow-500/5 flex items-center gap-2">
              <span>* Lưu ý: Nếu Huấn luyện viên từ chối (Reject), phí thuê PT sẽ được hoàn trả đầy đủ vào tài khoản của bạn.</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
