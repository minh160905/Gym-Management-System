import { useState } from "react";
import {
  useListMemberships, useCreateMembership, useUpdateMembership, useDeleteMembership,
  useListMembers, getListMembershipsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, CheckCircle2, Pencil, Trash2, Users,
  DollarSign, LayoutGrid, AlertTriangle
} from "lucide-react";
import type { MembershipPlan } from "@workspace/api-client-react";

const planSchema = z.object({
  name: z.string().min(1, "Tên gói tập là bắt buộc"),
  description: z.string().optional(),
  priceMonthly: z.coerce.number().min(0, "Giá tiền phải từ 0 trở lên"),
  durationMonths: z.coerce.number().int().min(1, "Thời hạn phải từ 1 tháng trở lên"),
  features: z.string().optional(),
  isActive: z.boolean(),
});
type PlanForm = z.infer<typeof planSchema>;

function PlanDialog({
  plan,
  onClose,
}: {
  plan: MembershipPlan | null;
  onClose: () => void;
}) {
  const isEdit = !!plan;
  const createMembership = useCreateMembership();
  const updateMembership = useUpdateMembership();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: plan?.name ?? "",
      description: plan?.description ?? "",
      priceMonthly: plan?.priceMonthly ?? 0,
      durationMonths: plan?.durationMonths ?? 1,
      features: plan?.features ?? "",
      isActive: plan?.isActive ?? true,
    },
  });

  async function onSubmit(values: PlanForm) {
    try {
      if (isEdit && plan) {
        await updateMembership.mutateAsync({ id: plan.id, data: values });
        toast({ title: "Cập nhật gói tập thành công" });
      } else {
        await createMembership.mutateAsync({ data: { ...values, durationMonths: values.durationMonths } });
        toast({ title: "Tạo gói tập thành công" });
      }
      await queryClient.invalidateQueries({ queryKey: getListMembershipsQueryKey() });
      onClose();
    } catch {
      toast({ title: isEdit ? "Cập nhật gói tập thất bại" : "Tạo gói tập thất bại", variant: "destructive" });
    }
  }

  const saving = createMembership.isPending || updateMembership.isPending;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa gói tập" : "Gói hội viên mới"}</DialogTitle>
          <p className="text-sm text-muted-foreground pt-1">
            {isEdit ? "Cập nhật thông tin chi tiết của gói tập này." : "Tạo gói hội viên mới cho hội viên đăng ký."}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form id="plan-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Name */}
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Tên gói tập</FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: Gói Premium" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Description */}
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả <span className="text-muted-foreground text-xs">(không bắt buộc)</span></FormLabel>
                <FormControl>
                  <Input placeholder="Mô tả ngắn gọn về gói tập này" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Price + Duration side by side */}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="priceMonthly" render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá mỗi tháng ($)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={0.01} placeholder="29.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="durationMonths" render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời hạn (tháng)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} step={1} placeholder="12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Features */}
            <FormField control={form.control} name="features" render={({ field }) => (
              <FormItem>
                <FormLabel>Đặc quyền <span className="text-muted-foreground text-xs">(ngăn cách bằng dấu phẩy)</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tập luyện tự do, Phòng tắm & Tủ khóa, Khu tạ tự do"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">Mỗi đặc quyền ngăn cách bằng dấu phẩy sẽ hiển thị dưới dạng danh sách.</p>
                <FormMessage />
              </FormItem>
            )} />

            {/* Active toggle */}
            <FormField control={form.control} name="isActive" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <FormLabel className="text-sm font-medium">Kích hoạt</FormLabel>
                    <p className="text-xs text-muted-foreground mt-0.5">Các gói không kích hoạt sẽ bị ẩn khỏi hội viên.</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </div>
              </FormItem>
            )} />
          </form>
        </Form>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Hủy</Button>
          <Button type="submit" form="plan-form" disabled={saving}>
            {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo gói tập"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  plan,
  subscriberCount,
  onClose,
}: {
  plan: MembershipPlan;
  subscriberCount: number;
  onClose: () => void;
}) {
  const deleteMembership = useDeleteMembership();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  async function handleDelete() {
    try {
      await deleteMembership.mutateAsync({ id: plan.id });
      await queryClient.invalidateQueries({ queryKey: getListMembershipsQueryKey() });
      toast({ title: `Đã xóa gói tập "${plan.name}"` });
      onClose();
    } catch {
      toast({ title: "Xóa gói tập thất bại", variant: "destructive" });
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Xóa gói tập
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-3">
          <p className="text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa gói tập{" "}
            <span className="font-semibold text-foreground">"{plan.name}"</span> không?
            Hành động này không thể hoàn tác.
          </p>
          {subscriberCount > 0 && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              Hiện có <span className="font-semibold">{subscriberCount} hội viên</span> đang sử dụng gói này. Gói tập của họ sẽ bị gỡ bỏ.
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={deleteMembership.isPending}>Hủy</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMembership.isPending}>
            {deleteMembership.isPending ? "Đang xóa..." : "Xóa gói tập"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function OwnerMemberships() {
  const { data: plans, isLoading } = useListMemberships();
  const { data: members } = useListMembers();

  const [editPlan, setEditPlan]     = useState<MembershipPlan | null>(null);
  const [deletePlan, setDeletePlan] = useState<MembershipPlan | null>(null);
  const [creating, setCreating]     = useState(false);

  // Count subscribers per plan
  function subscriberCount(planId: number) {
    return members?.filter((m) => m.membershipPlanId === planId && m.status === "active").length ?? 0;
  }

  const activePlans = plans?.filter((p) => p.isActive).length ?? 0;
  const totalRevenue = plans?.reduce((sum, p) => {
    const subs = subscriberCount(p.id);
    return sum + p.priceMonthly * subs;
  }, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gói hội viên</h1>
          <p className="text-muted-foreground mt-2">Quản lý các gói dịch vụ và giá cả.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4 mr-2" /> Gói tập mới
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-primary" /> Tổng số gói
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{plans?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{activePlans} hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Tổng số người đăng ký
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {members?.filter((m) => m.status === "active" && m.membershipPlanId).length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">hội viên đang sử dụng gói</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" /> Doanh thu tháng dự tính
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">từ hội viên đang hoạt động</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Plan cards */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-[340px] animate-pulse bg-muted/30" />
          ))}
        </div>
      ) : plans?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Chưa có gói hội viên nào</p>
          <p className="text-sm mt-1">Nhấn "Gói tập mới" để tạo gói đầu tiên.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans?.map((plan) => {
            const subs = subscriberCount(plan.id);
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col transition-colors hover:border-primary/50 ${!plan.isActive ? "opacity-60" : ""}`}
              >
                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  {plan.isActive ? (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">Hoạt động</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">Ngừng hoạt động</Badge>
                  )}
                </div>

                <CardHeader className="pr-24">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.description && <CardDescription className="text-sm">{plan.description}</CardDescription>}
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  {/* Price */}
                  <div>
                    <span className="text-4xl font-bold">${plan.priceMonthly}</span>
                    <span className="text-muted-foreground text-sm">/tháng</span>
                    <span className="text-xs text-muted-foreground ml-2">· {plan.durationMonths} tháng</span>
                  </div>

                  {/* Features */}
                  {plan.features && (
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {plan.features.split(",").map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          {f.trim()}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Subscriber count */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border">
                    <Users className="w-3.5 h-3.5" />
                    <span>{subs} hội viên đang hoạt động</span>
                  </div>
                </CardContent>

                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditPlan(plan)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Chỉnh sửa
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeletePlan(plan)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      {creating && <PlanDialog plan={null} onClose={() => setCreating(false)} />}

      {/* Edit dialog */}
      {editPlan && <PlanDialog plan={editPlan} onClose={() => setEditPlan(null)} />}

      {/* Delete dialog */}
      {deletePlan && (
        <DeleteDialog
          plan={deletePlan}
          subscriberCount={subscriberCount(deletePlan.id)}
          onClose={() => setDeletePlan(null)}
        />
      )}
    </div>
  );
}
