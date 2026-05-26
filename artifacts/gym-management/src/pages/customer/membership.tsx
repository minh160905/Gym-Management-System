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
import { CheckCircle2, User, Dumbbell, ChevronRight, ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { MembershipPlan, StaffMember } from "@workspace/api-client-react";

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

  // Dialog state
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [step, setStep] = useState<"confirm" | "trainer">("confirm");
  const [selectedTrainer, setSelectedTrainer] = useState<StaffMember | null>(null);
  const [saving, setSaving] = useState(false);

  function openPlan(plan: MembershipPlan) {
    setSelectedPlan(plan);
    setSelectedTrainer(null);
    setStep(isPTIncluded(plan.name) ? "trainer" : "confirm");
  }

  function closeDialog() {
    setSelectedPlan(null);
    setSelectedTrainer(null);
    setStep("confirm");
  }

  async function handleConfirm() {
    if (!memberId || !selectedPlan) return;
    setSaving(true);
    try {
      await createPayment.mutateAsync({
        data: {
          memberId,
          amount: selectedPlan.priceMonthly,
          description: `Payment for ${selectedPlan.name} Plan`,
          status: "paid",
          paymentDate: new Date().toISOString().split("T")[0],
          membershipPlanId: selectedPlan.id,
          paymentMethod: "credit_card",
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

      toast({
        title: "Subscription successful",
        description: selectedTrainer
          ? `You're now on the ${selectedPlan.name} plan with ${selectedTrainer.firstName} ${selectedTrainer.lastName} as your PT.`
          : `You're now subscribed to the ${selectedPlan.name} plan.`,
      });
      closeDialog();
    } catch {
      toast({ title: "Subscription failed", description: "Please try again.", variant: "destructive" });
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
              <Card
                key={plan.id}
                className={`flex flex-col transition-colors ${ptIncluded ? "border-primary/40 hover:border-primary/70" : "border-primary/20 hover:border-primary/50"}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    {ptIncluded && (
                      <Badge variant="default" className="text-xs">
                        PT Included
                      </Badge>
                    )}
                  </div>
                  {plan.description && <CardDescription>{plan.description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-4">
                    <span className="text-4xl font-bold">${plan.priceMonthly}</span>
                    <span className="text-muted-foreground">/mo</span>
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
                      Choose your personal trainer
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => openPlan(plan)}>
                    Subscribe
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Subscription Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-lg">
          {selectedPlan && (
            <>
              {/* Step: trainer picker (Standard / Premium) */}
              {step === "trainer" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-primary" />
                      Choose Your Personal Trainer
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground pt-1">
                      Your <span className="font-medium text-foreground">{selectedPlan.name}</span> plan includes access to a personal trainer. Pick one below or skip to decide later.
                    </p>
                  </DialogHeader>

                  <div className="space-y-3 py-2 max-h-72 overflow-y-auto pr-1">
                    {trainersLoading ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Loading trainers...</p>
                    ) : trainers?.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No trainers available right now.</p>
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
                            <p className="text-xs text-muted-foreground truncate">{trainer.specialization || "General Fitness"}</p>
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
                    <Button variant="outline" className="sm:mr-auto" onClick={() => { setSelectedTrainer(null); setStep("confirm"); }}>
                      Skip for now
                    </Button>
                    <Button onClick={() => setStep("confirm")} disabled={!selectedTrainer}>
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* Step: confirm */}
              {step === "confirm" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Confirm Subscription</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    {/* Plan summary */}
                    <div className="rounded-lg border border-border p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{selectedPlan.name} Plan</p>
                        <p className="font-bold text-primary text-lg">${selectedPlan.priceMonthly}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                    </div>

                    {/* Selected trainer */}
                    {isPTIncluded(selectedPlan.name) && (
                      <div className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Personal Trainer</p>
                          <button
                            type="button"
                            onClick={() => setStep("trainer")}
                            className="text-xs text-primary hover:underline"
                          >
                            Change
                          </button>
                        </div>
                        {selectedTrainer ? (
                          <div className="flex items-center gap-3 mt-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                              {selectedTrainer.firstName[0]}{selectedTrainer.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{selectedTrainer.firstName} {selectedTrainer.lastName}</p>
                              <p className="text-xs text-muted-foreground">{selectedTrainer.specialization || "General Fitness"}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            No trainer selected — you can choose one later from Hire PT.
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      By subscribing you agree to be charged ${selectedPlan.priceMonthly}/month. You can manage your plan at any time.
                    </p>
                  </div>

                  <DialogFooter className="gap-2">
                    {isPTIncluded(selectedPlan.name) && (
                      <Button variant="ghost" size="sm" onClick={() => setStep("trainer")} className="mr-auto">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                    )}
                    <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={saving}>
                      {saving ? "Subscribing..." : "Confirm & Subscribe"}
                    </Button>
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
