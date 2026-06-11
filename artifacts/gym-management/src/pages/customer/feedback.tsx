import { useListFeedback, useCreateFeedback, getListFeedbackQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const feedbackSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  serviceType: z.string().min(1, "Loại dịch vụ là bắt buộc"),
  comment: z.string().min(1, "Ý kiến đóng góp là bắt buộc"),
});

export default function CustomerFeedback() {
  const { memberId } = useAuth();
  const { data: feedback, isLoading } = useListFeedback({ memberId });
  const createFeedback = useCreateFeedback();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema as any),
    defaultValues: {
      rating: 5,
      serviceType: "general",
      comment: "",
    },
  });

  const onSubmit = (values: z.infer<typeof feedbackSchema>) => {
    if (!memberId) return;

    createFeedback.mutate({
      data: {
        memberId,
        rating: values.rating,
        serviceType: values.serviceType,
        comment: values.comment,
        isPublic: true,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFeedbackQueryKey({ memberId }) });
        form.reset({ rating: 5, serviceType: "general", comment: "" });
        toast({ title: "Đã gửi phản hồi", description: "Cảm ơn đóng góp ý kiến của bạn!" });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Phản hồi</h1>
        <p className="text-muted-foreground mt-2">Chia sẻ trải nghiệm của bạn với chúng tôi.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gửi phản hồi</CardTitle>
          <CardDescription>Hãy cho chúng tôi biết cách cải thiện dịch vụ tốt hơn.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="rating" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đánh giá (1-5)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Đánh giá" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="5">5 - Xuất sắc</SelectItem>
                        <SelectItem value="4">4 - Tốt</SelectItem>
                        <SelectItem value="3">3 - Trung bình</SelectItem>
                        <SelectItem value="2">2 - Kém</SelectItem>
                        <SelectItem value="1">1 - Tồi tệ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="serviceType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại dịch vụ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Chọn loại dịch vụ" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="general">Chung</SelectItem>
                        <SelectItem value="classes">Lớp học</SelectItem>
                        <SelectItem value="personal-training">Huấn luyện cá nhân (PT)</SelectItem>
                        <SelectItem value="facilities">Cơ sở vật chất & Thiết bị</SelectItem>
                        <SelectItem value="staff">Nhân viên</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="comment" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ý kiến đóng góp</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Chia sẻ suy nghĩ của bạn..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={createFeedback.isPending}>
                {createFeedback.isPending ? "Đang gửi..." : "Gửi phản hồi"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Phản hồi trước đây của tôi</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full">Đang tải...</div>
          ) : feedback?.map(item => (
            <Card key={item.id} className="bg-muted/30">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary">
                    {item.serviceType === "general" ? "Chung" :
                     item.serviceType === "classes" ? "Lớp học" :
                     item.serviceType === "personal-training" ? "PT Cá nhân" :
                     item.serviceType === "facilities" ? "Cơ sở vật chất" :
                     item.serviceType === "staff" ? "Nhân viên" : item.serviceType}
                  </Badge>
                  <div className="text-yellow-500 text-sm">
                    {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{item.comment}</p>
                <div className="text-xs text-muted-foreground mt-4">
                  {format(new Date(item.createdAt), "dd/MM/yyyy")}
                </div>
              </CardContent>
            </Card>
          ))}
          {feedback?.length === 0 && (
            <div className="col-span-full text-muted-foreground text-center py-8">
              Chưa có phản hồi nào được gửi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
