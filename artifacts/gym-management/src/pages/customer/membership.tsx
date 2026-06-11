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
        <h1 className="text-3xl font-bold tracking-tight">Membership</h1>
        <p className="text-muted-foreground mt-2">Choose a plan that fits your goals.</p>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading plans...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans?.map((plan) => {
            const ptIncluded = isPTIncluded(plan.name);
            return (
              <div key={plan.id} className="card-container">
                <div className="title-card">
                  <p>{plan.name}</p>
                  {ptIncluded && (
                    <Badge variant="default" className="text-[10px] bg-white/20 hover:bg-white/30 text-white border-none py-0.5 px-2">
                      PT Included
                    </Badge>
                  )}
                </div>
                <div className="card-content">
                  <div className="plain">
                    <span>${plan.priceMonthly}</span>
                    <span className="text-[11px] text-zinc-500 ml-1">/mo</span>
                  </div>
                  
                  {plan.description && (
                    <div className="title text-[12px] italic">{plan.description}</div>
                  )}

                  {plan.features && (
                    <ul className="space-y-2 text-zinc-400 text-[12px] flex-1">
                      {plan.features.split(",").map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{f.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {ptIncluded && (
                    <div className="flex items-center gap-2 text-[12px] text-emerald-400 font-medium">
                      <Dumbbell className="w-4 h-4 shrink-0" />
                      <span>Choose your personal trainer</span>
                    </div>
                  )}

                  <button className="card-btn mt-4" onClick={() => openPlan(plan)}>
                    Subscribe
                  </button>
                </div>
              </div>
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
                      Choose Your Personal Trainer
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground pt-1">
                      Your <span className="font-medium text-foreground">{selectedPlan.name}</span> plan includes a personal trainer. Pick one or skip to decide later.
                    </p>
                  </DialogHeader>

                  <div className="space-y-3 py-2 max-h-64 overflow-y-auto pr-1">
                    {trainersLoading ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Loading trainers...</p>
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
                            <p className="text-xs text-muted-foreground truncate">{trainer.specializations || "General Fitness"}</p>
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
                      Skip for now
                    </Button>
                    <Button onClick={() => setStep("payment")} disabled={!selectedTrainer}>
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
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
                      Payment
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground pt-1">
                      Review your order and complete payment.
                    </p>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    {/* Order summary */}
                    <div className="rounded-lg border border-border p-4 space-y-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Order Summary</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{selectedPlan.name} Plan</p>
                          <p className="text-xs text-muted-foreground">{selectedPlan.description}</p>
                        </div>
                        <p className="font-bold text-primary text-lg">
                          ${selectedPlan.priceMonthly}
                          <span className="text-xs font-normal text-muted-foreground">/mo</span>
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
                                <p className="text-sm text-muted-foreground">No trainer selected</p>
                              </>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep("trainer")}
                            className="text-xs text-primary hover:underline"
                          >
                            Change
                          </button>
                        </div>
                      )}

                      <div className="border-t border-border pt-3 flex items-center justify-between font-semibold">
                        <p>Total due today</p>
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
                      You will be charged ${selectedPlan.priceMonthly}/month. Cancel anytime from your profile.
                    </p>
                  </div>

                  <DialogFooter className="gap-2">
                    {isPTIncluded(selectedPlan.name) && (
                      <Button variant="ghost" size="sm" onClick={() => setStep("trainer")} className="mr-auto">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                    )}
                    <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
                    <Button onClick={handlePay} disabled={saving}>
                      {saving ? "Processing..." : `Pay $${selectedPlan.priceMonthly}.00`}
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* ── Step: Success ─────────────────────────────── */}
              {step === "success" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Subscription Active</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <div className="p-4 rounded-full bg-primary/10 ring-1 ring-primary/20">
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">Payment successful</p>
                      <p className="text-muted-foreground text-sm">
                        You're now subscribed to the{" "}
                        <span className="font-medium text-foreground">{selectedPlan.name}</span> plan.
                      </p>
                      {selectedTrainer && (
                        <p className="text-muted-foreground text-sm mt-1">
                          A request has been sent to{" "}
                          <span className="font-medium text-foreground">
                            {selectedTrainer.firstName} {selectedTrainer.lastName}
                          </span>{" "}
                          as your personal trainer.
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button className="w-full" onClick={closeDialog}>Done</Button>
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
