import { useGetMember, useListMemberships, useListPayments, useListUsers } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  User, Mail, Phone, Calendar, CreditCard, Lock, AtSign, Shield,
  AlertCircle, FileText, DollarSign
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

export default function CustomerProfile() {
  const { memberId, userId } = useAuth();
  const { data: member, isLoading: memberLoading } = useGetMember(memberId ?? 0, { query: { enabled: !!memberId } });
  const { data: plans } = useListMemberships();
  const { data: payments } = useListPayments({ memberId: memberId ?? undefined });
  const { data: users } = useListUsers();

  const plan = plans?.find((p) => p.id === member?.membershipPlanId);
  const account = users?.find((u) => u.id === userId);

  if (memberLoading) {
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
    </div>
  );
}
