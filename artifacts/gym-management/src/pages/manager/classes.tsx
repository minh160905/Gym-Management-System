import { useListClasses } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function ManagerClasses() {
  const { data: classes, isLoading } = useListClasses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Class Schedule</h1>
        <p className="text-muted-foreground mt-2">Manage fitness classes and capacity.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : classes?.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell>
                    <div className="font-medium">{cls.name}</div>
                    <div className="text-sm text-muted-foreground">{cls.category}</div>
                  </TableCell>
                  <TableCell>{cls.trainerName}</TableCell>
                  <TableCell>
                    <div>{format(new Date(cls.scheduledAt), 'MMM d, h:mm a')}</div>
                    <div className="text-sm text-muted-foreground">{cls.durationMinutes} min</div>
                  </TableCell>
                  <TableCell>{cls.enrolledCount} / {cls.capacity}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{cls.status}</Badge>
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
