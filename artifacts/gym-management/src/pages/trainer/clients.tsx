import { useListMembers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function TrainerClients() {
  const { data: members, isLoading } = useListMembers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Clients</h1>
        <p className="text-muted-foreground mt-2">View progress and details for your assigned clients.</p>
      </div>

      <Card>
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
              {isLoading ? (
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
