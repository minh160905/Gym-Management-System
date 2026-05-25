import { useGetMember, useListMemberships, useGetMemberTrainingHistory, useListPayments, useListFeedback } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { User, Phone, Mail, Calendar, CreditCard, AlertCircle, FileText, Star, Dumbbell } from "lucide-react";

interface MemberDetailDialogProps {
  memberId: number | null;
  onClose: () => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function MemberDetailDialog({ memberId, onClose }: MemberDetailDialogProps) {
  const { data: member, isLoading } = useGetMember(memberId ?? 0, { query: { enabled: !!memberId } });
  const { data: plans } = useListMemberships();
  const { data: history } = useGetMemberTrainingHistory(memberId ?? 0, { query: { enabled: !!memberId } });
  const { data: payments } = useListPayments({ memberId: memberId ?? undefined });
  const { data: feedback } = useListFeedback({ memberId: memberId ?? undefined });

  const plan = plans?.find((p) => p.id === member?.membershipPlanId);

  return (
    <Dialog open={!!memberId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Member Profile
          </DialogTitle>
        </DialogHeader>

        {isLoading || !member ? (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        ) : (
          <Tabs defaultValue="personal" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="membership">Membership</TabsTrigger>
              <TabsTrigger value="history">Training</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="personal" className="space-y-4 mt-0">
                <div className="flex items-center gap-4 pb-4 border-b border-border">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{member.firstName} {member.lastName}</h2>
                    <Badge variant={member.status === "active" ? "default" : "secondary"} className="mt-1">
                      {member.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow icon={Mail} label="Email" value={member.email} />
                  <InfoRow icon={Phone} label="Phone" value={member.phone} />
                  <InfoRow icon={Calendar} label="Date of Birth" value={member.dateOfBirth ? format(new Date(member.dateOfBirth), "MMM d, yyyy") : null} />
                  <InfoRow icon={Calendar} label="Join Date" value={member.joinDate ? format(new Date(member.joinDate), "MMM d, yyyy") : null} />
                  <InfoRow icon={Calendar} label="Expiry Date" value={member.expiryDate ? format(new Date(member.expiryDate), "MMM d, yyyy") : null} />
                  <InfoRow icon={AlertCircle} label="Emergency Contact" value={member.emergencyContact} />
                </div>
                {member.notes && (
                  <div className="pt-2">
                    <InfoRow icon={FileText} label="Notes" value={member.notes} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="membership" className="space-y-4 mt-0">
                {plan ? (
                  <Card>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{plan.description}</p>
                      <div className="flex items-center gap-2 text-primary font-bold text-xl">
                        <CreditCard className="w-5 h-5" />
                        ${plan.priceMonthly}/mo
                      </div>
                      <p className="text-sm text-muted-foreground">Duration: {plan.durationMonths} month(s)</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No active membership plan.</div>
                )}

                <h4 className="font-medium mt-4">Payment History</h4>
                {payments && payments.length > 0 ? (
                  <div className="space-y-2">
                    {payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium">{p.description}</p>
                          <p className="text-xs text-muted-foreground">{p.paymentDate} · {p.paymentMethod ?? "N/A"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${Number(p.amount).toFixed(2)}</p>
                          <Badge variant={p.status === "paid" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">No payment records.</div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {history && history.items.length > 0 ? (
                  <div className="space-y-2">
                    {history.items.map((item) => (
                      <div key={`${item.type}-${item.id}`} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                        <div className={`mt-0.5 p-1.5 rounded-md ${item.type === "session" ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-400"}`}>
                          <Dumbbell className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.scheduledAt ? format(new Date(item.scheduledAt), "MMM d, yyyy") : "N/A"}
                            {item.trainerName ? ` · ${item.trainerName}` : ""}
                            {item.durationMinutes ? ` · ${item.durationMinutes} min` : ""}
                          </p>
                        </div>
                        <Badge variant={item.status === "completed" ? "default" : "secondary"} className="text-xs shrink-0">
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No training history.</div>
                )}
              </TabsContent>

              <TabsContent value="feedback" className="mt-0">
                {feedback && feedback.length > 0 ? (
                  <div className="space-y-3">
                    {feedback.map((f) => (
                      <Card key={f.id}>
                        <CardContent className="pt-4 pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="text-xs capitalize">{f.serviceType}</Badge>
                            <div className="flex text-yellow-500 text-sm">
                              {"★".repeat(f.rating)}
                              <span className="text-muted-foreground">{"★".repeat(5 - f.rating)}</span>
                            </div>
                          </div>
                          <p className="text-sm">{f.comment}</p>
                          <p className="text-xs text-muted-foreground mt-2">{format(new Date(f.createdAt), "MMM d, yyyy")}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No feedback submitted.</div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
