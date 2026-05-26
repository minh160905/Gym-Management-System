import { useState } from "react";
import { useListStaff } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { TrainerDetailDialog } from "@/components/trainer-detail-dialog";

function roleBadge(role: string) {
  switch (role) {
    case "trainer":     return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 capitalize">Personal Trainer</Badge>;
    case "manager":     return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-400/30 capitalize">Manager</Badge>;
    case "receptionist":return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-400/30 capitalize">Receptionist</Badge>;
    default:            return <Badge variant="outline" className="capitalize">{role}</Badge>;
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

export default function ManagerStaff() {
  const { data: staff, isLoading } = useListStaff();
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
        <p className="text-muted-foreground mt-2">View and manage employee information.</p>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : staff?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No staff found.</TableCell></TableRow>
              ) : staff?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                  <TableCell>{roleBadge(member.role)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.phone ?? "—"}</TableCell>
                  <TableCell className="text-sm">{format(new Date(member.hireDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>{statusBadge(member.status)}</TableCell>
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

      <TrainerDetailDialog
        staffId={selectedStaffId}
        onClose={() => setSelectedStaffId(null)}
      />
    </div>
  );
}
