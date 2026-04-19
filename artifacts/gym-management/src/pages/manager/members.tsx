import { useState } from "react";
import { useListMembers, useListFeedback } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ManagerMembers() {
  const { data: members, isLoading: membersLoading } = useListMembers();
  const { data: feedback } = useListFeedback();
  
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const memberFeedback = selectedMemberId ? feedback?.filter(f => f.memberId === selectedMemberId) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <p className="text-muted-foreground mt-2">View and manage member accounts.</p>
      </div>

      <Dialog open={!!selectedMemberId} onOpenChange={(open) => !open && setSelectedMemberId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Member Feedback History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {memberFeedback && memberFeedback.length > 0 ? (
              memberFeedback.map(f => (
                <Card key={f.id}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-muted-foreground">{format(new Date(f.createdAt), "MMM d, yyyy")}</span>
                      <Badge variant="secondary" className="w-fit mt-1">{f.serviceType}</Badge>
                    </div>
                    <div className="text-yellow-500">
                      {"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{f.comment}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No feedback submitted by this member.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : members?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.membershipPlanName || 'None'}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(member.joinDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedMemberId(member.id)}>
                      View Feedback
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
