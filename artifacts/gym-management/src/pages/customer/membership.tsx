import { useState } from "react";
import {
  useListMemberships, useCreatePayment, useUpdateMember,
  useListStaff, useCreatePTRequest,
  getListMembershipsQueryKey, getGetMemberQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, User, Dumbbell, ChevronRight, ChevronLeft, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { MembershipPlan, StaffMember } from "@workspace/api-client-react";
import PaymentSection, { type PaymentMethod, type CardData } from "@/components/payment-section";

type Step = "trainer" | "payment" | "success";

const DEFAULT_CARD: CardData = { cardType: "visa", cardNumber: "", expiry: "", cvv: "" };

function isPTIncluded(planName: string) {
  const n = planName.toLowerCase();
  return n.includes("standard") || n.includes("premium");
}

export default function CustomerMembership() {
  const { memberId } = useAuth();
  const { data: plans, isLoading } = useListMemberships();
  const { data: trainers, isLoading: trainersLoading } = useListStaff({ role: "trainer" });
  const createPayment = useCreatePayment();
  const updateMember = useUpdateMember();
  const createPTRequest = useCreatePTRequest();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [step, setStep] = useState<Step>("payment");
  const [selectedTrainer, setSelectedTrainer] = useState<StaffMember | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [cardData, setCardData] = useState<CardData>(DEFAULT_CARD);
  const [saving, setSaving] = useState(false);

  function openPlan(plan: MembershipPlan) {
    setSelectedPlan(plan);
    setSelectedTrainer(null);
    setPaymentMethod("credit_card");
    setCardData(DEFAULT_CARD);
    setStep(isPTIncluded(plan.name) ? "trainer" : "payment");
  }

  function closeDialog() {
    setSelectedPlan(null);
    setSelectedTrainer(null);
    setStep("payment");
  }

  async function handlePay() {
    if (!memberId || !selectedPlan) return;
    setSaving(true);
    try {
      await createPayment.mutateAsync({
        data: {
          memberId,
          amount: selectedPlan.priceMonthly,
          description: `${selectedPlan.name} Plan — Monthly Subscription`,
          status: "paid",
          paymentDate: new Date().toISOString().split("T")[0],
          membershipPlanId: selectedPlan.id,
          paymentMethod,
        },
      });

      await updateMember.mutateAsync({
        id: memberId,
        data: { membershipPlanId: selectedPlan.id },
      });

      if (selectedTrainer) {
        await createPTRequest.mutateAsync({
          data: {
            memberId,
            trainerId: selectedTrainer.id,
            message: `Preferred trainer selected during ${selectedPlan.name} plan subscription.`,
            preferredSchedule: "To be arranged",
          },
        });
      }

      await queryClient.invalidateQueries({ queryKey: getListMembershipsQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetMemberQueryKey(memberId) });
      setStep("success");
    } catch {
      toast({ title: "Payment failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Đăng ký gói tập</h1>
        <p className="text-muted-foreground mt-2">Chọn gói hội viên phù hợp với mục tiêu tập luyện của bạn.</p>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Đang tải các gói tập...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans?.map((plan) => {
            const ptIncluded = isPTIncluded(plan.name);
            return (
              <Card
                key={plan.id}
                className={`flex flex-col transition-colors ${ptIncluded ? "border-primary/40 hover:border-primary/70" : "border-primary/20 hover:border-primary/50"}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    {ptIncluded && <Badge variant="default" className="text-xs">Bao gồm PT</Badge>}
                  </div>
                  {plan.description && <CardDescription>{plan.description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-4">
                    <span className="text-4xl font-bold">${plan.priceMonthly}</span>
                    <span className="text-muted-foreground">/tháng</span>
                  </div>
                  {plan.features && (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {plan.features.split(",").map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {f.trim()}
                        </li>
                      ))}
                    </ul>
                  )}
                  {ptIncluded && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-primary font-medium">
                      <Dumbbell className="w-4 h-4" />
                      Lựa chọn huấn luyện viên cá nhân
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => openPlan(plan)}>
                    Đăng ký gói tập
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Subscription Dialog ─────────────────────────────────── */}
      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-lg">
          {selectedPlan && (
            <>
              {/* ── Step: Trainer Picker ──────────────────────── */}
              {step === "trainer" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-primary" />
                      Chọn Huấn luyện viên cá nhân
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground pt-1">
                      Gói tập <span className="font-medium text-foreground">{selectedPlan.name}</span> của bạn đã bao gồm huấn luyện viên cá nhân. Hãy chọn một người hoặc bỏ qua để chọn sau.
                    </p>
                  </DialogHeader>

                  <div className="space-y-3 py-2 max-h-64 overflow-y-auto pr-1">
                    {trainersLoading ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Đang tải danh sách huấn luyện viên...</p>
                    ) : trainers?.map((trainer) => (
                      <button
                        key={trainer.id}
                        type="button"
                        onClick={() => setSelectedTrainer(selectedTrainer?.id === trainer.id ? null : trainer)}
                        className={`w-full text-left rounded-lg border p-3 transition-colors ${
                          selectedTrainer?.id === trainer.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {trainer.firstName[0]}{trainer.lastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{trainer.firstName} {trainer.lastName}</p>
                            <p className="text-xs text-muted-foreground truncate">{trainer.specializations || "Thể hình tự do"}</p>
                          </div>
                          {selectedTrainer?.id === trainer.id && (
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          )}
                        </div>
                        {trainer.bio && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 pl-12">{trainer.bio}</p>
                        )}
                      </button>
                    ))}
                  </div>

                  <DialogFooter className="gap-2 flex-col sm:flex-row">
                    <Button variant="outline" className="sm:mr-auto" onClick={() => { setSelectedTrainer(null); setStep("payment"); }}>
                      Bỏ qua lúc này
                    </Button>
                    <Button onClick={() => setStep("payment")} disabled={!selectedTrainer}>
                      Tiếp tục <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* ── Step: Payment ────────────────────────────── */}
              {step === "payment" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Thanh toán
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground pt-1">
                      Kiểm tra lại đơn hàng và hoàn tất thanh toán.
                    </p>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    {/* Order summary */}
                    <div className="rounded-lg border border-border p-4 space-y-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tóm tắt đơn hàng</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Gói {selectedPlan.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedPlan.description}</p>
                        </div>
                        <p className="font-bold text-primary text-lg">
                          ${selectedPlan.priceMonthly}
                          <span className="text-xs font-normal text-muted-foreground">/tháng</span>
                        </p>
                      </div>

                      {isPTIncluded(selectedPlan.name) && (
                        <div className="border-t border-border pt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {selectedTrainer ? (
                              <>
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                  {selectedTrainer.firstName[0]}{selectedTrainer.lastName[0]}
                                </div>
                                <p className="text-sm">{selectedTrainer.firstName} {selectedTrainer.lastName}</p>
                              </>
                            ) : (
                              <>
                                <User className="w-4 h-4 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Chưa chọn huấn luyện viên</p>
                              </>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep("trainer")}
                            className="text-xs text-primary hover:underline"
                          >
                            Thay đổi
                          </button>
                        </div>
                      )}

                      <div className="border-t border-border pt-3 flex items-center justify-between font-semibold">
                        <p>Tổng tiền thanh toán hôm nay</p>
                        <p className="text-primary">${selectedPlan.priceMonthly}.00</p>
                      </div>
                    </div>

                    <PaymentSection
                      paymentMethod={paymentMethod}
                      onPaymentMethodChange={setPaymentMethod}
                      cardData={cardData}
                      onCardDataChange={setCardData}
                      amount={selectedPlan.priceMonthly}
                      reference={`MEMBER-${memberId}-PLAN-${selectedPlan.id}`}
                    />

                    <p className="text-xs text-muted-foreground">
                      Bạn sẽ được tính phí ${selectedPlan.priceMonthly}/tháng. Có thể hủy gói bất kỳ lúc nào từ trang cá nhân của bạn.
                    </p>
                  </div>

                  <DialogFooter className="gap-2">
                    {isPTIncluded(selectedPlan.name) && (
                      <Button variant="ghost" size="sm" onClick={() => setStep("trainer")} className="mr-auto">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
                      </Button>
                    )}
                    <Button variant="outline" onClick={closeDialog} disabled={saving}>Hủy</Button>
                    <Button onClick={handlePay} disabled={saving}>
                      {saving ? "Đang xử lý..." : `Thanh toán $${selectedPlan.priceMonthly}.00`}
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* ── Step: Success ─────────────────────────────── */}
              {step === "success" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Kích hoạt gói tập thành công</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <div className="p-4 rounded-full bg-primary/10 ring-1 ring-primary/20">
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">Giao dịch thành công</p>
                      <p className="text-muted-foreground text-sm">
                        Bạn đã đăng ký thành công gói tập{" "}
                        <span className="font-medium text-foreground">{selectedPlan.name}</span>.
                      </p>
                      {selectedTrainer && (
                        <p className="text-muted-foreground text-sm mt-1">
                          Một yêu cầu đã được gửi đến huấn luyện viên cá nhân{" "}
                          <span className="font-medium text-foreground">
                            {selectedTrainer.firstName} {selectedTrainer.lastName}
                          </span>.
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button className="w-full" onClick={closeDialog}>Hoàn tất</Button>
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
