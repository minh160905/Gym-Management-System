import { useState } from "react";
import { useListStaff, useListPTRequests, useCreatePTRequest, getListPTRequestsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

const ptRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  preferredSchedule: z.string().min(1, "Preferred schedule is required"),
});

export default function CustomerHirePT() {
  const { memberId } = useAuth();
  const { data: trainers, isLoading: trainersLoading } = useListStaff({ role: "trainer" });
  const { data: requests, isLoading: requestsLoading } = useListPTRequests({ memberId });
  const createReq = useCreatePTRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedTrainer, setSelectedTrainer] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof ptRequestSchema>>({
    resolver: zodResolver(ptRequestSchema),
    defaultValues: {
      message: "",
      preferredSchedule: "",
    },
  });

  const handleHire = (trainerId: number) => {
    setSelectedTrainer(trainerId);
    form.reset({ message: "", preferredSchedule: "" });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof ptRequestSchema>) => {
    if (!memberId || !selectedTrainer) return;

    createReq.mutate({
      data: {
        memberId,
        trainerId: selectedTrainer,
        message: values.message,
        preferredSchedule: values.preferredSchedule,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPTRequestsQueryKey({ memberId }) });
        setIsDialogOpen(false);
        toast({ title: "Request submitted successfully" });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "pending": return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600">Pending</Badge>;
      case "approved": return <Badge variant="outline" className="bg-primary/20 text-primary">Approved</Badge>;
      case "rejected": return <Badge variant="outline" className="bg-destructive/20 text-destructive">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hire a Personal Trainer</h1>
        <p className="text-muted-foreground mt-2">Find the right trainer for your goals.</p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit PT Request</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="preferredSchedule" render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Schedule</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Mon/Wed evenings" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="message" render={({ field }) => (
                <FormItem>
                  <FormLabel>Message / Goals</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell the trainer about your fitness goals..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={createReq.isPending}>
                  {createReq.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Available Trainers</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trainersLoading ? (
            <div>Loading trainers...</div>
          ) : trainers?.map(trainer => (
            <Card key={trainer.id}>
              <CardHeader>
                <CardTitle>{trainer.firstName} {trainer.lastName}</CardTitle>
                <CardDescription>{trainer.specializations || "General Fitness"}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {trainer.bio || "No bio available."}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleHire(trainer.id)}>Hire {trainer.firstName}</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {requests && requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell>{format(new Date(req.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-medium">{req.trainerName}</TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
