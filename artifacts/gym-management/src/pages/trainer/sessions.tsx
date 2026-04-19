import { useState } from "react";
import { useListSessions, useUpdateSession, getListSessionsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const sessionSchema = z.object({
  notes: z.string().optional(),
});

export default function TrainerSessions() {
  const { staffId } = useAuth();
  const { data: sessions, isLoading } = useListSessions({ trainerId: staffId });
  const updateSession = useUpdateSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [evaluatingSession, setEvaluatingSession] = useState<any | null>(null);

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      notes: "",
    },
  });

  const handleEvaluate = (session: any) => {
    setEvaluatingSession(session);
    form.reset({ notes: session.notes || "" });
  };

  const onSubmit = (values: z.infer<typeof sessionSchema>) => {
    if (!evaluatingSession) return;
    
    updateSession.mutate({
      id: evaluatingSession.id,
      data: {
        status: "completed",
        notes: values.notes,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey({ trainerId: staffId }) });
        setEvaluatingSession(null);
        toast({ title: "Session marked as completed" });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled": return <Badge variant="outline" className="bg-primary/20 text-primary">Scheduled</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-500/20 text-green-600">Completed</Badge>;
      case "cancelled": return <Badge variant="outline" className="bg-destructive/20 text-destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">PT Sessions</h1>
        <p className="text-muted-foreground mt-2">Manage your personal training schedule and evaluate past sessions.</p>
      </div>

      <Dialog open={!!evaluatingSession} onOpenChange={(open) => !open && setEvaluatingSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evaluate Session with {evaluatingSession?.memberName}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Notes & Performance</FormLabel>
                  <FormControl>
                    <Textarea placeholder="How did the client perform? Any adjustments needed?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEvaluatingSession(null)}>Cancel</Button>
                <Button type="submit" disabled={updateSession.isPending}>
                  {updateSession.isPending ? "Saving..." : "Mark as Completed"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : sessions?.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.memberName}</TableCell>
                  <TableCell>{format(new Date(session.scheduledAt), 'MMM d, yyyy h:mm a')}</TableCell>
                  <TableCell>{session.location || '-'}</TableCell>
                  <TableCell>{getStatusBadge(session.status)}</TableCell>
                  <TableCell className="text-right">
                    {session.status === "scheduled" && (
                      <Button size="sm" onClick={() => handleEvaluate(session)}>
                        Evaluate
                      </Button>
                    )}
                    {session.status === "completed" && session.notes && (
                      <span className="text-sm text-muted-foreground truncate max-w-[150px] inline-block" title={session.notes}>
                        {session.notes}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {sessions?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No sessions scheduled.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
