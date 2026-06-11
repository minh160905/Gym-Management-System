import { useState, useEffect } from "react";
import {
  useCreateStaff, useCreateUser,
  getListStaffQueryKey,
} from "@workspace/api-client-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, KeyRound, Eye, EyeOff } from "lucide-react";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

const ROLES_NEEDING_ACCOUNT = ["trainer", "manager"];

const ROLE_TO_USER_ROLE: Record<string, string> = {
  trainer: "trainer",
  manager: "manager",
};

const schema = z.object({
  firstName:       z.string().min(1, "Required"),
  lastName:        z.string().min(1, "Required"),
  email:           z.string().email("Invalid email"),
  phone:           z.string().optional(),
  role:            z.string().min(1, "Required"),
  hireDate:        z.string().min(1, "Required"),
  status:          z.string().min(1, "Required"),
  salary:          z.coerce.number().optional(),
  specializations: z.string().optional(),
  bio:             z.string().optional(),

  createAccount:   z.boolean(),
  fullName:        z.string().optional(),
  username:        z.string().optional(),
  password:        z.string().optional(),
  confirmPassword: z.string().optional(),
}).superRefine((val, ctx) => {
  if (val.createAccount) {
    if (!val.fullName || val.fullName.trim().length === 0) {
      ctx.addIssue({ code: "custom", path: ["fullName"], message: "Required" });
    }
    if (!val.username || val.username.trim().length < 3) {
      ctx.addIssue({ code: "custom", path: ["username"], message: "At least 3 characters" });
    }
    if (!val.password || val.password.length < 6) {
      ctx.addIssue({ code: "custom", path: ["password"], message: "At least 6 characters" });
    }
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match" });
    }
  }
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateStaffDialog({ open, onClose }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const createStaff = useCreateStaff();
  const createUser  = useCreateUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const today = new Date().toISOString().split("T")[0];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      firstName: "", lastName: "", email: "", phone: "",
      role: "", hireDate: today, status: "active",
      salary: undefined, specializations: "", bio: "",
      createAccount: false,
      fullName: "", username: "", password: "", confirmPassword: "",
    },
  });

  const role          = form.watch("role");
  const createAccount = form.watch("createAccount");
  const firstName     = form.watch("firstName");
  const lastName      = form.watch("lastName");

  const needsAccount = ROLES_NEEDING_ACCOUNT.includes(role);

  useEffect(() => {
    if (needsAccount) {
      form.setValue("createAccount", true);
    }
  }, [needsAccount, form]);

  useEffect(() => {
    if (firstName || lastName) {
      const current = form.getValues("fullName");
      if (!current || current === form.getValues("firstName") || current.trim() === "") {
        form.setValue("fullName", `${firstName} ${lastName}`.trim());
      }
    }
  }, [firstName, lastName]);

  async function onSubmit(values: FormValues) {
    try {
      const staffRecord = await createStaff.mutateAsync({
        data: {
          firstName:       values.firstName,
          lastName:        values.lastName,
          email:           values.email,
          phone:           values.phone || null,
          role:            values.role,
          hireDate:        values.hireDate,
          status:          values.status,
          salary:          values.salary ?? null,
          specializations: values.specializations || null,
          bio:             values.bio || null,
        },
      });

      if (values.createAccount) {
        await createUser.mutateAsync({
          data: {
            username:  values.username!,
            password:  values.password!,
            fullName:  values.fullName!,
            role:      ROLE_TO_USER_ROLE[values.role] ?? "manager",
            staffId:   staffRecord.id,
            memberId:  null,
          },
        });
      }

      await queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
      toast({
        title: "Staff member added",
        description: values.createAccount
          ? `${values.firstName} ${values.lastName} added with login account.`
          : `${values.firstName} ${values.lastName} added to staff directory.`,
      });
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Please try again.";
      toast({ title: "Failed to add staff member", description: msg, variant: "destructive" });
    }
  }

  function handleClose() {
    form.reset();
    setShowPassword(false);
    onClose();
  }

  const isPending = createStaff.isPending || createUser.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Add Staff Member
          </DialogTitle>
          <DialogDescription>
            Fill in the employee details. Trainers and managers also get a system login account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* ── Personal Information ─────────────────────────── */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Personal Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Jane" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Smith" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="email" placeholder="jane@ironforge.gym" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input placeholder="555-0100" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="trainer">Personal Trainer</SelectItem>
                        <SelectItem value="receptionist">Receptionist</SelectItem>
                        <SelectItem value="cleaning_staff">Cleaning Staff</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status <span className="text-destructive">*</span></FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="hireDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hire Date <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="salary" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Salary ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number" min={0} step={500}
                        placeholder="50000"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {role === "trainer" && (
                <FormField control={form.control} name="specializations" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specializations</FormLabel>
                    <FormControl><Input placeholder="e.g. Strength & Conditioning, HIIT, Yoga" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio / Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Brief professional background or notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* ── Login Account ────────────────────────────────── */}
            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Login Account</h3>
                  {needsAccount && (
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">Required</Badge>
                  )}
                </div>
                {!needsAccount && (
                  <FormField control={form.control} name="createAccount" render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormLabel className="text-sm text-muted-foreground font-normal cursor-pointer">
                        Create login account
                      </FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />
                )}
              </div>

              {needsAccount && (
                <p className="text-xs text-muted-foreground -mt-2">
                  {role === "trainer" ? "Personal trainers" : "Managers"} require a system login to access their portal.
                </p>
              )}

              {createAccount && (
                <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name (display) <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input placeholder="Jane Smith" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="username" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input placeholder="jsmith" autoComplete="off" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Min 6 characters"
                              autoComplete="new-password"
                              className="pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Repeat password"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              )}
            </div>

            {/* ── Actions ──────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Add Staff Member"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
