import { useListStaff } from "@workspace/api-client-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye } from "lucide-react";
import { TrainerDetailDialog } from "@/components/trainer-detail-dialog";

export default function OwnerStaff() {
  const { data: staff, isLoading } = useListStaff();
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Directory</h1>
          <p className="text-muted-foreground mt-2">Manage trainers, managers, and other personnel.</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> Add Staff Member</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : staff?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No staff found.</TableCell></TableRow>
              ) : staff?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-medium">{member.firstName} {member.lastName}</div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                  </TableCell>
                  <TableCell className="capitalize">{member.role}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>{member.status}</Badge>
                  </TableCell>
                  <TableCell>{member.salary ? `$${member.salary.toLocaleString()}` : '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedStaffId(member.id)}>
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TrainerDetailDialog staffId={selectedStaffId} onClose={() => setSelectedStaffId(null)} />
    </div>
  );
}
