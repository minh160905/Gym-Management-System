import { useListAttendance } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function ManagerAttendance() {
  const { data: attendance, isLoading } = useListAttendance();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Log</h1>
        <p className="text-muted-foreground mt-2">Track member check-ins and class attendance.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Class (Optional)</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : attendance?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.memberName}</TableCell>
                  <TableCell>{record.className || '-'}</TableCell>
                  <TableCell>{format(new Date(record.checkedInAt), 'MMM d, h:mm a')}</TableCell>
                  <TableCell>{record.checkedOutAt ? format(new Date(record.checkedOutAt), 'MMM d, h:mm a') : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
