import { useListFeedback } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function ManagerFeedback() {
  const { data: feedback, isLoading } = useListFeedback();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground mt-2">View all member feedback and ratings.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : feedback?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">{format(new Date(item.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-medium">{item.memberName || "Anonymous"}</TableCell>
                  <TableCell><Badge variant="secondary">{item.serviceType}</Badge></TableCell>
                  <TableCell>
                    <div className="flex text-yellow-500">
                      {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md truncate" title={item.comment}>{item.comment}</TableCell>
                </TableRow>
              ))}
              {feedback?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No feedback yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
