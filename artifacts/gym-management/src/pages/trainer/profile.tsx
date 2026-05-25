import { useState } from "react";
import {
  useGetStaff, useListSessions, useListUsers,
  useUpdateStaff, getGetStaffQueryKey
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  User, Mail, Phone, Calendar, Lock, AtSign, Shield,
  Briefcase, DollarSign, Clock, CheckCircle2, Pencil
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
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: trainer, isLoading: trainerLoading } = useGetStaff(staffId ?? 0, { query: { enabled: !!staffId } });
  const { data: sessions } = useListSessions({ trainerId: staffId ?? undefined });
  const { data: users } = useListUsers();
  const updateStaff = useUpdateStaff();

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ phone: "", specializations: "", bio: "" });
  const [saving, setSaving] = useState(false);

  const account = users?.find((u) => u.id === userId);
  const completedSessions = sessions?.filter((s) => s.status === "completed") ?? [];
  const scheduledSessions = sessions?.filter((s) => s.status === "scheduled") ?? [];

  function openEdit() {
    setForm({
      phone: trainer?.phone ?? "",
      specializations: trainer?.specialization ?? "",
      bio: trainer?.bio ?? "",
    });
    setEditOpen(true);
  }

  async function handleSave() {
    if (!staffId) return;
    setSaving(true);
    try {
      await updateStaff.mutateAsync({ id: staffId, data: form });
      await queryClient.invalidateQueries({ queryKey: getGetStaffQueryKey(staffId) });
      setEditOpen(false);
      toast({ title: "Profile updated", description: "Your information has been saved." });
    } catch {
      toast({ title: "Update failed", description: "Could not save your changes.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (trainerLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading your profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-2">Your personal information and account details.</p>
        </div>
        {trainer && (
          <Button onClick={openEdit} variant="outline">
            <Pencil className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        )}
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
                <InfoRow icon={Calendar} label="Hire Date" value={trainer.hireDate ? format(new Date(trainer.hireDate), "MMMM d, yyyy") : null} />
                <InfoRow icon={Briefcase} label="Role" value={trainer.role?.replace("_", " ")} />
                <InfoRow icon={DollarSign} label="Salary" value={trainer.salary ? `$${Number(trainer.salary).toLocaleString()}/yr` : null} />
                <InfoRow icon={User} label="Specialization" value={trainer.specialization} />
                {trainer.bio && <InfoRow icon={Briefcase} label="Bio" value={trainer.bio} />}
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

        {/* Session Overview */}
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

            {sessions?.length === 0 && (
              <p className="text-sm text-muted-foreground">No sessions recorded yet.</p>
            )}

            {completedSessions.length > 0 && scheduledSessions.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {completedSessions.length} session(s) completed. No upcoming sessions.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-primary" /> Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Input
                placeholder="e.g. Strength Training, Yoga, HIIT"
                value={form.specializations}
                onChange={(e) => setForm((f) => ({ ...f, specializations: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                placeholder="Tell members about yourself..."
                rows={4}
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
