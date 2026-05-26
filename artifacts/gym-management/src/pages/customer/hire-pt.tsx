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
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import {
  CreditCard, Landmark, Wallet, ChevronRight, ChevronLeft,
  CheckCircle2, Dumbbell, User
} from "lucide-react";
import type { StaffMember } from "@workspace/api-client-react";

const PT_SESSION_FEE = 50;

const detailsSchema = z.object({
  preferredSchedule: z.string().min(1, "Preferred schedule is required"),
  message: z.string().min(1, "Please describe your goals"),
});

type PaymentMethod = "credit_card" | "bank_transfer" | "cash";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { id: "credit_card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "bank_transfer", label: "Bank Transfer", icon: Landmark },
  { id: "cash", label: "Cash", icon: Wallet },
];

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
  const [saving, setSaving] = useState(false);

  const form = useForm<z.infer<typeof detailsSchema>>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { message: "", preferredSchedule: "" },
  });

  function openDialog(trainer: StaffMember) {
    setSelectedTrainer(trainer);
    setStep("details");
    setPaymentMethod("credit_card");
    form.reset();
  }

  function closeDialog() {
    setSelectedTrainer(null);
    setStep("details");
    form.reset();
  }

  async function handleConfirmPayment() {
    if (!memberId || !selectedTrainer) return;
    const values = form.getValues();
    setSaving(true);
    try {
      await createPayment.mutateAsync({
        data: {
          memberId,
          amount: PT_SESSION_FEE,
          description: `PT Hire Fee — ${selectedTrainer.firstName} ${selectedTrainer.lastName}`,
          status: "paid",
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMethod,
        },
      });

      await createReq.mutateAsync({
        data: {
          memberId,
          trainerId: selectedTrainer.id,
          message: values.message,
          preferredSchedule: values.preferredSchedule,
        },
      });

      await queryClient.invalidateQueries({ queryKey: getListPTRequestsQueryKey({ memberId }) });
      setStep("success");
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":   return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600">Pending</Badge>;
      case "approved":  return <Badge variant="outline" className="bg-primary/20 text-primary">Approved</Badge>;
      case "rejected":  return <Badge variant="outline" className="bg-destructive/20 text-destructive">Rejected</Badge>;
      default:          return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hire a Personal Trainer</h1>
        <p className="text-muted-foreground mt-2">Find the right trainer for your goals.</p>
      </div>

      {/* Trainer Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trainersLoading ? (
          <p className="text-muted-foreground col-span-3">Loading trainers...</p>
        ) : trainers?.map((trainer) => (
          <Card key={trainer.id} className="flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  {trainer.firstName[0]}{trainer.lastName[0]}
                </div>
                <div>
                  <CardTitle className="text-base">{trainer.firstName} {trainer.lastName}</CardTitle>
                  <CardDescription className="text-xs">{trainer.specialization || "General Fitness"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {trainer.bio || "No bio available."}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">${PT_SESSION_FEE} / session</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => openDialog(trainer)}>
                Hire {trainer.firstName}
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
              {/* ── Step 1: Details ───────────────────────────────── */}
              {step === "details" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-primary" />
                      Hire {selectedTrainer.firstName} {selectedTrainer.lastName}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground pt-1">
                      Tell your trainer about your schedule and goals.
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
                          <FormLabel>Preferred Schedule</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Mon/Wed evenings" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="message" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fitness Goals</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your fitness goals and what you'd like to work on..."
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
                    <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                    <Button type="submit" form="details-form">
                      Next: Payment <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* ── Step 2: Payment ───────────────────────────────── */}
              {step === "payment" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Session Fee Payment
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground pt-1">
                      A one-time session fee is required to hire your trainer.
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
                          <p className="font-medium text-sm">{selectedTrainer.firstName} {selectedTrainer.lastName}</p>
                          <p className="text-xs text-muted-foreground">{selectedTrainer.specialization || "General Fitness"}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <p className="text-sm text-muted-foreground">PT Session Fee</p>
                        <p className="font-bold text-lg text-primary">${PT_SESSION_FEE}.00</p>
                      </div>
                    </div>

                    {/* Payment method */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Payment Method</Label>
                      <div className="space-y-2">
                        {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setPaymentMethod(id)}
                            className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                              paymentMethod === id
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${paymentMethod === id ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="text-sm font-medium">{label}</span>
                            {paymentMethod === id && (
                              <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setStep("details")} className="mr-auto">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
                    <Button onClick={handleConfirmPayment} disabled={saving}>
                      {saving ? "Processing..." : `Pay $${PT_SESSION_FEE}.00`}
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* ── Step 3: Success ───────────────────────────────── */}
              {step === "success" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Request Submitted</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <div className="p-4 rounded-full bg-primary/10 ring-1 ring-primary/20">
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">Payment successful</p>
                      <p className="text-muted-foreground text-sm">
                        Your ${PT_SESSION_FEE} session fee has been paid and your request has been sent to{" "}
                        <span className="font-medium text-foreground">{selectedTrainer.firstName} {selectedTrainer.lastName}</span>.
                      </p>
                      <p className="text-muted-foreground text-sm mt-2">
                        You'll hear back once the trainer approves your request.
                      </p>
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

      {/* My Requests */}
      {requests && requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My PT Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="text-sm">{format(new Date(req.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-medium">{req.trainerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{req.preferredSchedule || "—"}</TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
