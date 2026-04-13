import { useListSessions } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function TrainerSessions() {
  const { data: sessions, isLoading } = useListSessions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">PT Sessions</h1>
        <p className="text-muted-foreground mt-2">Manage your personal training schedule.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : sessions?.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.memberName}</TableCell>
                  <TableCell>{format(new Date(session.scheduledAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{format(new Date(session.scheduledAt), 'h:mm a')}</TableCell>
                  <TableCell>{session.location || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{session.status}</Badge>
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
