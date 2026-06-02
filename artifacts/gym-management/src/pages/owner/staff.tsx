import { useState } from "react";
import { useListStaff } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye } from "lucide-react";
import { format } from "date-fns";
import { TrainerDetailDialog } from "@/components/trainer-detail-dialog";
import { CreateStaffDialog } from "@/components/create-staff-dialog";

function roleBadge(role: string) {
  switch (role) {
    case "trainer":        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Personal Trainer</Badge>;
    case "manager":        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-400/30">Manager</Badge>;
    case "receptionist":   return <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-400/30">Receptionist</Badge>;
    case "cleaning_staff": return <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-400/30">Cleaning Staff</Badge>;
    case "maintenance":    return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-400/30">Maintenance</Badge>;
    default:               return <Badge variant="outline" className="capitalize">{role.replace(/_/g, " ")}</Badge>;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "active":   return <Badge variant="default">Active</Badge>;
    case "inactive": return <Badge variant="secondary">Inactive</Badge>;
    case "on_leave": return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-400/30">On Leave</Badge>;
    default:         return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function OwnerStaff() {
  const { data: staff, isLoading } = useListStaff();
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const activeCount  = staff?.filter((s) => s.status === "active").length ?? 0;
  const trainerCount = staff?.filter((s) => s.role === "trainer").length ?? 0;
  const totalSalary  = staff?.reduce((sum, s) => sum + (s.salary ? Number(s.salary) : 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Directory</h1>
          <p className="text-muted-foreground mt-2">Manage trainers, managers, and all personnel.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Staff Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Staff",         value: staff?.length ?? 0 },
          { label: "Active",              value: activeCount },
          { label: "Personal Trainers",   value: trainerCount },
          { label: "Est. Annual Payroll", value: totalSalary ? `$${totalSalary.toLocaleString()}` : "—" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Hired</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : staff?.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No staff found.</TableCell></TableRow>
              ) : staff?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                  <TableCell>{roleBadge(member.role)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.phone ?? "—"}</TableCell>
                  <TableCell className="text-sm">{format(new Date(member.hireDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>{statusBadge(member.status)}</TableCell>
                  <TableCell className="text-sm">
                    {member.salary ? `$${Number(member.salary).toLocaleString()}/yr` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedStaffId(member.id)}>
                      <Eye className="w-4 h-4 mr-1" /> View / Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TrainerDetailDialog staffId={selectedStaffId} onClose={() => setSelectedStaffId(null)} />
      <CreateStaffDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
