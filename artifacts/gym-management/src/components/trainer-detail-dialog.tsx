import { useGetStaff, useListSessions, useListPTRequests } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { User, Phone, Mail, Calendar, Star, FileText, Clock } from "lucide-react";

interface TrainerDetailDialogProps {
  staffId: number | null;
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

export function TrainerDetailDialog({ staffId, onClose }: TrainerDetailDialogProps) {
  const { data: trainer, isLoading } = useGetStaff(staffId ?? 0, { query: { enabled: !!staffId } });
  const { data: sessions } = useListSessions({ trainerId: staffId ?? undefined });
  const { data: ptRequests } = useListPTRequests({ trainerId: staffId ?? undefined });

  const completedSessions = sessions?.filter((s) => s.status === "completed") ?? [];
  const upcomingSessions = sessions?.filter((s) => s.status === "scheduled") ?? [];

  return (
    <Dialog open={!!staffId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Trainer Profile
          </DialogTitle>
        </DialogHeader>

        {isLoading || !trainer ? (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        ) : (
          <Tabs defaultValue="personal" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="requests">PT Requests</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="personal" className="space-y-4 mt-0">
                <div className="flex items-center gap-4 pb-4 border-b border-border">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                    {trainer.firstName[0]}{trainer.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{trainer.firstName} {trainer.lastName}</h2>
                    <p className="text-sm text-muted-foreground capitalize">{trainer.role}</p>
                    <Badge variant={trainer.status === "active" ? "default" : "secondary"} className="mt-1">
                      {trainer.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InfoRow icon={Mail} label="Email" value={trainer.email} />
                  <InfoRow icon={Phone} label="Phone" value={trainer.phone} />
                  <InfoRow icon={Calendar} label="Hire Date" value={trainer.hireDate ? format(new Date(trainer.hireDate), "MMM d, yyyy") : null} />
                  <InfoRow icon={Star} label="Specializations" value={trainer.specializations} />
                </div>

                {trainer.bio && (
                  <div className="pt-2 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Bio</p>
                    <p className="text-sm leading-relaxed">{trainer.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{completedSessions.length}</p>
                    <p className="text-xs text-muted-foreground">Sessions Done</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{upcomingSessions.length}</p>
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {ptRequests?.filter((r) => r.status === "approved").length ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Active Clients</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sessions" className="mt-0">
                {sessions && sessions.length > 0 ? (
                  <div className="space-y-2">
                    {sessions.map((s) => (
                      <div key={s.id} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                        <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">PT Session</p>
                          <p className="text-xs text-muted-foreground">
                            {s.scheduledAt ? format(new Date(s.scheduledAt), "MMM d, yyyy · h:mm a") : "N/A"}
                            {s.durationMinutes ? ` · ${s.durationMinutes} min` : ""}
                          </p>
                          {s.notes && <p className="text-xs text-muted-foreground mt-1 italic">{s.notes}</p>}
                        </div>
                        <Badge variant={s.status === "completed" ? "default" : "secondary"} className="text-xs shrink-0">
                          {s.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No sessions on record.</div>
                )}
              </TabsContent>

              <TabsContent value="requests" className="mt-0">
                {ptRequests && ptRequests.length > 0 ? (
                  <div className="space-y-3">
                    {ptRequests.map((r) => (
                      <Card key={r.id}>
                        <CardContent className="pt-4 pb-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm">{r.memberName}</p>
                            <Badge
                              variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {r.status}
                            </Badge>
                          </div>
                          {r.preferredSchedule && (
                            <p className="text-xs text-muted-foreground">Schedule: {r.preferredSchedule}</p>
                          )}
                          {r.message && <p className="text-sm mt-1 text-muted-foreground italic">{r.message}</p>}
                          <p className="text-xs text-muted-foreground mt-2">{format(new Date(r.createdAt), "MMM d, yyyy")}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No PT requests.</div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
