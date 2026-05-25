import { useGetStaff, useListSessions, useListUsers } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  User, Mail, Phone, Calendar, Lock, AtSign, Shield,
  Briefcase, DollarSign, Clock, CheckCircle2
} from "lucide-react";

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 text-primary shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

export default function TrainerProfile() {
  const { staffId, userId } = useAuth();
  const { data: trainer, isLoading: trainerLoading } = useGetStaff(staffId ?? 0, { query: { enabled: !!staffId } });
  const { data: sessions } = useListSessions({ trainerId: staffId ?? undefined });
  const { data: users } = useListUsers();

  const account = users?.find((u) => u.id === userId);
  const completedSessions = sessions?.filter((s) => s.status === "completed") ?? [];
  const scheduledSessions = sessions?.filter((s) => s.status === "scheduled") ?? [];

  if (trainerLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">Loading your profile...</div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-2">Your personal information and account details.</p>
      </div>

      {/* Profile Header */}
      {trainer && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                {trainer.firstName[0]}{trainer.lastName[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{trainer.firstName} {trainer.lastName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={trainer.status === "active" ? "default" : "secondary"}>
                    {trainer.status}
                  </Badge>
                  <span className="text-muted-foreground text-sm capitalize">{trainer.role?.replace("_", " ")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {trainer ? (
              <>
                <InfoRow icon={Mail} label="Email" value={trainer.email} />
                <InfoRow icon={Phone} label="Phone" value={trainer.phone} />
                <InfoRow icon={Calendar} label="Join Date" value={trainer.hireDate ? format(new Date(trainer.hireDate), "MMMM d, yyyy") : null} />
                <InfoRow icon={Briefcase} label="Role" value={trainer.role?.replace("_", " ")} />
                <InfoRow icon={DollarSign} label="Salary" value={trainer.salary ? `$${Number(trainer.salary).toLocaleString()}/yr` : null} />
                <InfoRow icon={User} label="Specialization" value={trainer.specialization} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-4">No personal information found.</p>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {account ? (
              <>
                <InfoRow icon={AtSign} label="Username" value={account.username} />
                <InfoRow icon={User} label="Full Name" value={account.fullName} />
                <InfoRow icon={Shield} label="Role" value="Personal Trainer" />
                <InfoRow icon={Lock} label="Password" value="••••••••" />
                <InfoRow icon={Calendar} label="Account Created" value={format(new Date(account.createdAt), "MMMM d, yyyy")} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-4">Loading account info...</p>
            )}
          </CardContent>
        </Card>

        {/* Session Statistics */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Session Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{sessions?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Total Sessions</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{completedSessions.length}</p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Completed</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{scheduledSessions.length}</p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Upcoming</p>
              </div>
            </div>

            {scheduledSessions.length > 0 && (
              <>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Upcoming Sessions</h4>
                <div className="space-y-2">
                  {scheduledSessions.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{s.notes ?? `Session #${s.id}`}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.scheduledAt ? format(new Date(s.scheduledAt), "MMM d, yyyy · h:mm a") : "TBD"}
                            {s.durationMinutes ? ` · ${s.durationMinutes} min` : ""}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Scheduled</Badge>
                    </div>
                  ))}
                </div>
              </>
            )}

            {completedSessions.length > 0 && scheduledSessions.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {completedSessions.length} session(s) completed. No upcoming sessions.
              </div>
            )}

            {sessions?.length === 0 && (
              <p className="text-sm text-muted-foreground">No sessions recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
