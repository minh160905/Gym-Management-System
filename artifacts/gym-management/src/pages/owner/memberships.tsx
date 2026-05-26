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
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  priceMonthly: z.coerce.number().min(0, "Price must be 0 or more"),
  durationMonths: z.coerce.number().int().min(1, "Duration must be at least 1 month"),
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
        toast({ title: "Plan updated successfully" });
      } else {
        await createMembership.mutateAsync({ data: { ...values, durationMonths: values.durationMonths } });
        toast({ title: "Plan created successfully" });
      }
      await queryClient.invalidateQueries({ queryKey: getListMembershipsQueryKey() });
      onClose();
    } catch {
      toast({ title: isEdit ? "Failed to update plan" : "Failed to create plan", variant: "destructive" });
    }
  }

  const saving = createMembership.isPending || updateMembership.isPending;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Plan" : "New Membership Plan"}</DialogTitle>
          <p className="text-sm text-muted-foreground pt-1">
            {isEdit ? "Update the details of this membership tier." : "Create a new subscription tier for your members."}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form id="plan-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Name */}
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Plan Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Premium" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Description */}
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="Brief description of this plan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Price + Duration side by side */}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="priceMonthly" render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={0.01} placeholder="29.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="durationMonths" render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (months)</FormLabel>
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
                <FormLabel>Features <span className="text-muted-foreground text-xs">(comma-separated)</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Gym floor access, Locker room, Free weights"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">Each comma-separated item appears as a bullet point.</p>
                <FormMessage />
              </FormItem>
            )} />

            {/* Active toggle */}
            <FormField control={form.control} name="isActive" render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <FormLabel className="text-sm font-medium">Active</FormLabel>
                    <p className="text-xs text-muted-foreground mt-0.5">Inactive plans are hidden from customers.</p>
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
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="plan-form" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Plan"}
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
      toast({ title: `"${plan.name}" plan deleted` });
      onClose();
    } catch {
      toast({ title: "Failed to delete plan", variant: "destructive" });
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete Plan
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-3">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete the{" "}
            <span className="font-semibold text-foreground">"{plan.name}"</span> plan?
            This action cannot be undone.
          </p>
          {subscriberCount > 0 && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              <span className="font-semibold">{subscriberCount} member{subscriberCount !== 1 ? "s" : ""}</span> are currently
              on this plan. Their plan assignment will be removed.
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={deleteMembership.isPending}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMembership.isPending}>
            {deleteMembership.isPending ? "Deleting..." : "Delete Plan"}
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
          <h1 className="text-3xl font-bold tracking-tight">Membership Plans</h1>
          <p className="text-muted-foreground mt-2">Manage subscription tiers and pricing.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Plan
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-primary" /> Total Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{plans?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{activePlans} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Total Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {members?.filter((m) => m.status === "active" && m.membershipPlanId).length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">active members on a plan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" /> Est. Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">from active subscribers</p>
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
          <p className="font-medium">No membership plans yet</p>
          <p className="text-sm mt-1">Click "New Plan" to create your first one.</p>
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
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">Inactive</Badge>
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
                    <span className="text-muted-foreground text-sm">/mo</span>
                    <span className="text-xs text-muted-foreground ml-2">· {plan.durationMonths} month(s)</span>
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
                    <span>{subs} active subscriber{subs !== 1 ? "s" : ""}</span>
                  </div>
                </CardContent>

                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditPlan(plan)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
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
