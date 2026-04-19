import { useGetMemberTrainingHistory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";

export default function CustomerTrainingHistory() {
  const { memberId } = useAuth();
  // Ensure we pass a valid number to the hook; if memberId is null, pass 0 (it will be disabled by the hook if configured)
  const { data: history, isLoading } = useGetMemberTrainingHistory(memberId || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Training History</h1>
        <p className="text-muted-foreground mt-2">View your past classes and PT sessions.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : history?.items?.map(item => (
                <TableRow key={`${item.type}-${item.id}`}>
                  <TableCell className="whitespace-nowrap">{format(new Date(item.scheduledAt), "MMM d, yyyy h:mm a")}</TableCell>
                  <TableCell>
                    <Badge variant={item.type === "class" ? "default" : "secondary"} className="capitalize">
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.trainerName || "-"}</TableCell>
                  <TableCell>{item.durationMinutes ? `${item.durationMinutes} min` : "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{item.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {history?.items?.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No history found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
