import { useListPayments, useUpdatePayment, getListPaymentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function CustomerPayments() {
  const { memberId } = useAuth();
  const { data: payments, isLoading } = useListPayments({ memberId });
  const updatePayment = useUpdatePayment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handlePay = (id: number) => {
    updatePayment.mutate({ id, data: { status: "paid" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey({ memberId }) });
        toast({ title: "Payment successful" });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending": return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600">Pending</Badge>;
      case "paid": return <Badge variant="outline" className="bg-primary/20 text-primary">Paid</Badge>;
      case "failed": return <Badge variant="outline" className="bg-destructive/20 text-destructive">Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground mt-2">View your billing history and make payments.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : payments?.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell className="whitespace-nowrap">{format(new Date(payment.paymentDate), "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-medium">{payment.description}</TableCell>
                  <TableCell className="capitalize">{payment.paymentMethod?.replace("_", " ") || "-"}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-right">
                    {payment.status === "pending" && (
                      <Button size="sm" onClick={() => handlePay(payment.id)} disabled={updatePayment.isPending}>
                        Pay Now
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {payments?.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No payments found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
