import { useState } from "react";
import { 
  useListSessions, 
  useUpdateSession, 
  getListSessionsQueryKey,
  useCreateSession,
  useListPTRequests
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, MapPin, Clipboard } from "lucide-react";

const sessionSchema = z.object({
  notes: z.string().optional(),
});

const addSessionSchema = z.object({
  memberId: z.string().min(1, "Vui lòng chọn khách hàng"),
  scheduledAt: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
  durationMinutes: z.coerce.number().min(1, "Vui lòng nhập thời lượng"),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type AddSessionFormValues = z.infer<typeof addSessionSchema>;

export default function TrainerSessions() {
  const { staffId } = useAuth();
  const { data: sessions, isLoading } = useListSessions({ trainerId: staffId });
  const { data: ptRequests } = useListPTRequests({ trainerId: staffId });
  
  const updateSession = useUpdateSession();
  const createSession = useCreateSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [evaluatingSession, setEvaluatingSession] = useState<any | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Filter clients who have hired this PT (status === "confirm" or "approved")
  const activeClients = ptRequests?.filter(r => r.status === "confirm" || r.status === "approved") || [];

  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema as any),
    defaultValues: {
      notes: "",
    },
  });

  const addForm = useForm<AddSessionFormValues>({
    resolver: zodResolver(addSessionSchema as any),
    defaultValues: {
      memberId: "",
      scheduledAt: "",
      durationMinutes: 60,
      location: "",
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

  const onAddSubmit = async (values: AddSessionFormValues) => {
    if (!staffId) return;
    try {
      await createSession.mutateAsync({
        data: {
          trainerId: staffId,
          memberId: parseInt(values.memberId),
          scheduledAt: values.scheduledAt,
          durationMinutes: values.durationMinutes,
          status: "scheduled",
          location: values.location || null,
          notes: values.notes || null,
        }
      });
      
      queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey({ trainerId: staffId }) });
      setAddOpen(false);
      addForm.reset();
      toast({ 
        title: "Lên lịch thành công", 
        description: "Buổi tập PT mới đã được lên lịch thành công." 
      });
    } catch (error: any) {
      const errMsg = error?.response?.data?.error || error?.message || "Không thể thêm buổi tập.";
      toast({ 
        title: "Lỗi lên lịch buổi tập", 
        description: errMsg, 
        variant: "destructive" 
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled": return <Badge variant="outline" className="bg-primary/20 text-primary">Đã đặt lịch</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-500/20 text-green-600">Hoàn thành</Badge>;
      case "cancelled": return <Badge variant="outline" className="bg-destructive/20 text-destructive">Đã hủy</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buổi tập PT</h1>
          <p className="text-muted-foreground mt-2">Quản lý lịch tập cá nhân và đánh giá buổi tập.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Thêm buổi tập
        </Button>
      </div>

      {/* Evaluate Dialog */}
      <Dialog open={!!evaluatingSession} onOpenChange={(open) => !open && setEvaluatingSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đánh giá buổi tập với {evaluatingSession?.memberName}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú & Hiệu suất buổi tập</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Khách hàng thực hiện như thế nào? Cần điều chỉnh gì không?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEvaluatingSession(null)}>Hủy</Button>
                <Button type="submit" disabled={updateSession.isPending}>
                  {updateSession.isPending ? "Đang lưu..." : "Đánh dấu hoàn thành"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Session Dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => !open && setAddOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lên lịch buổi tập PT mới</DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
              <FormField control={addForm.control} name="memberId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Khách hàng</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn khách hàng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeClients.length === 0 ? (
                        <div className="p-2 text-xs text-muted-foreground text-center">Chưa có khách hàng thuê PT</div>
                      ) : (
                        activeClients.map((c) => (
                          <SelectItem key={c.memberId} value={c.memberId.toString()}>
                            {c.memberName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={addForm.control} name="scheduledAt" render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời gian bắt đầu</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={addForm.control} name="durationMinutes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời lượng (phút)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={addForm.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vị trí phòng tập</FormLabel>
                  <FormControl>
                    <Input placeholder="Khu vực tập luyện" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={addForm.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ghi chú kế hoạch tập luyện hoặc chuẩn bị..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={createSession.isPending}>
                  {createSession.isPending ? "Đang lưu..." : "Lên lịch"}
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
                <TableHead>Khách hàng</TableHead>
                <TableHead>Ngày & Giờ</TableHead>
                <TableHead>Thời lượng</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Đang tải...</TableCell></TableRow>
              ) : sessions?.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.memberName}</TableCell>
                  <TableCell>{format(new Date(session.scheduledAt), 'dd/MM/yyyy · hh:mm a')}</TableCell>
                  <TableCell>{session.durationMinutes} phút</TableCell>
                  <TableCell>{session.location || '-'}</TableCell>
                  <TableCell>{getStatusBadge(session.status)}</TableCell>
                  <TableCell className="text-right">
                    {session.status === "scheduled" && (
                      <Button size="sm" onClick={() => handleEvaluate(session)}>
                        Đánh giá
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
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Chưa có buổi tập nào được lập lịch.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
