import { useListSessions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function TrainerDashboard() {
  // Ideally we would filter by trainerId=CURRENT_USER_ID, but we'll list all for demo
  const { data: sessions, isLoading } = useListSessions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trainer Dashboard</h1>
        <p className="text-muted-foreground mt-2">Your upcoming sessions and clients.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : sessions?.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.memberName}</TableCell>
                    <TableCell>{format(new Date(session.scheduledAt), 'MMM d, h:mm a')}</TableCell>
                    <TableCell>{session.durationMinutes} min</TableCell>
                    <TableCell>
                      <Badge variant="outline">{session.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
