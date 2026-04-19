import { useListMembers, useListPTRequests, useUpdatePTRequest, getListPTRequestsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";

export default function TrainerClients() {
  const { staffId } = useAuth();
  const { data: members, isLoading: membersLoading } = useListMembers();
  const { data: ptRequests, isLoading: ptLoading } = useListPTRequests({ trainerId: staffId });
  const updateReq = useUpdatePTRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleUpdateReq = (id: number, status: string) => {
    updateReq.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPTRequestsQueryKey({ trainerId: staffId }) });
        toast({ title: `Request ${status}` });
      }
    });
  };

  const pendingRequests = ptRequests?.filter(r => r.status === "pending") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Clients</h1>
        <p className="text-muted-foreground mt-2">View progress and details for your assigned clients.</p>
      </div>

      {pendingRequests.length > 0 && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>Pending PT Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Schedule Preference</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.memberName}</TableCell>
                    <TableCell>{req.message || "-"}</TableCell>
                    <TableCell>{req.preferredSchedule || "-"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleUpdateReq(req.id, "rejected")}>
                        <XCircle className="w-4 h-4 mr-1" /> Decline
                      </Button>
                      <Button size="sm" onClick={() => handleUpdateReq(req.id, "approved")}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : members?.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.firstName} {client.lastName}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell className="text-muted-foreground">Not set</TableCell>
                  <TableCell>{format(new Date(client.joinDate), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
