import { useState, useRef } from "react";
import {
  useGetMember, useListMemberships, useListPayments, useListUsers,
  useUpdateMember, getGetMemberQueryKey
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
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  User, Mail, Phone, Calendar, CreditCard, Lock, AtSign, Shield,
  AlertCircle, FileText, DollarSign, Pencil, QrCode, Download, Info
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

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

export default function CustomerProfile() {
  const { memberId, userId } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: member, isLoading: memberLoading } = useGetMember(memberId ?? 0, { query: { enabled: !!memberId } });
  const { data: plans } = useListMemberships();
  const { data: payments } = useListPayments({ memberId: memberId ?? undefined });
  const { data: users } = useListUsers();
  const updateMember = useUpdateMember();

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ phone: "", emergencyContact: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);

  const qrValue = memberId ? `GYM-MEMBER-${memberId}` : "";

  function downloadQR() {
    const canvas = qrRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `gym-qr-member-${memberId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const plan = member?.status === "expired" ? undefined : plans?.find((p) => p.id === member?.membershipPlanId);
  const account = users?.find((u) => u.id === userId);

  function openEdit() {
    setForm({
      phone: member?.phone ?? "",
      emergencyContact: member?.emergencyContact ?? "",
      notes: member?.notes ?? "",
    });
    setEditOpen(true);
  }

  async function handleSave() {
    if (!memberId) return;
    setSaving(true);
    try {
      await updateMember.mutateAsync({ id: memberId, data: form });
      await queryClient.invalidateQueries({ queryKey: getGetMemberQueryKey(memberId) });
      setEditOpen(false);
      toast({ title: "Profile updated", description: "Your information has been saved." });
    } catch {
      toast({ title: "Update failed", description: "Could not save your changes.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (memberLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading your profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-2">Your personal information and account details.</p>
        </div>
        {member && (
          <Button onClick={openEdit} variant="outline">
            <Pencil className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Header */}
      {member && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                {member.firstName[0]}{member.lastName[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{member.firstName} {member.lastName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={member.status === "active" ? "default" : "secondary"}>
                    {member.status}
                  </Badge>
                  <span className="text-muted-foreground text-sm">Member</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Check-in */}
      {member && memberId && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="w-4 h-4 text-primary" />
              Mã QR Check-in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* QR Code */}
              <div className="flex-shrink-0 p-4 bg-white rounded-2xl shadow-md ring-1 ring-primary/20">
                <QRCodeCanvas
                  ref={qrRef}
                  value={qrValue}
                  size={160}
                  level="H"
                  marginSize={2}
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Thành viên</p>
                  <p className="font-bold text-lg">{member.firstName} {member.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Member ID</p>
                  <p className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">#{memberId}</p>
                </div>
                {member.status === "expired" ? (
                  <div className="flex items-start gap-2 text-xs text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-500" />
                    <span className="font-medium">Gói hội viên đã hết hạn. Bạn không thể check-in cho đến khi gia hạn gói mới.</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg p-3">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                    <span>Xuất trình mã QR này tại lễ tân để check-in khi tới phòng tập.</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 w-full sm:w-auto"
                  onClick={downloadQR}
                >
                  <Download className="w-4 h-4" />
                  Tải QR Code
                </Button>
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
            {member ? (
              <>
                <InfoRow icon={Mail} label="Email" value={member.email} />
                <InfoRow icon={Phone} label="Phone" value={member.phone} />
                <InfoRow icon={Calendar} label="Date of Birth" value={member.dateOfBirth ? format(new Date(member.dateOfBirth), "MMMM d, yyyy") : null} />
                <InfoRow icon={Calendar} label="Join Date" value={member.joinDate ? format(new Date(member.joinDate), "MMMM d, yyyy") : null} />
                <InfoRow icon={Calendar} label="Membership Expiry" value={member.expiryDate ? format(new Date(member.expiryDate), "MMMM d, yyyy") : null} />
                <InfoRow icon={AlertCircle} label="Emergency Contact" value={member.emergencyContact} />
                {member.notes && <InfoRow icon={FileText} label="Notes" value={member.notes} />}
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
                <InfoRow icon={Shield} label="Role" value="Customer" />
                <InfoRow icon={Lock} label="Password" value="••••••••" />
                <InfoRow icon={Calendar} label="Account Created" value={format(new Date(account.createdAt), "MMMM d, yyyy")} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-4">Loading account info...</p>
            )}
          </CardContent>
        </Card>

        {/* Membership Plan */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Current Membership
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plan ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mt-0.5">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">${plan.priceMonthly}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.durationMonths} month(s)</p>
                  </div>
                </div>
                {member?.expiryDate && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Expires {format(new Date(member.expiryDate), "MMMM d, yyyy")}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">No active membership plan. Visit the Membership page to enroll.</p>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payments && payments.length > 0 ? (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{p.description}</p>
                      <p className="text-xs text-muted-foreground">{p.paymentDate} · {p.paymentMethod ?? "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${Number(p.amount).toFixed(2)}</p>
                      <Badge variant={p.status === "paid" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">No payment records found.</p>
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
              <Label>Emergency Contact</Label>
              <Input
                placeholder="Name and phone number"
                value={form.emergencyContact}
                onChange={(e) => setForm((f) => ({ ...f, emergencyContact: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any additional notes..."
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
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
