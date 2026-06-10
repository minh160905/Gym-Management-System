import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLoginUser, useCreateUser, useCreateMember, useResetPassword } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type View = "login" | "register" | "forgot";

// ── Schemas ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const forgotSchema = z.object({
  username: z.string().min(1, "Username is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ── Background / Shell ────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-zinc-950/0 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')] bg-cover bg-center opacity-[0.03] mix-blend-overlay" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6 ring-1 ring-primary/20">
            <Building2 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">IRON & FORGE</h1>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────

function LoginView({ onSwitch }: { onSwitch: (v: View) => void }) {
  const { setAuth } = useAuth();
  const [, setLocation] = useLocation();
  const loginUser = useLoginUser();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginUser.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          setAuth(data.user);
          setLocation(`/${data.user.role}/dashboard`);
        },
      }
    );
  };

  const setDemo = (username: string) => {
    form.setValue("username", username);
    form.setValue("password", "admin123");
  };

  return (
    <>
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl mb-4">
        <CardHeader>
          <CardTitle className="text-zinc-100">Sign In</CardTitle>
          <CardDescription className="text-zinc-400">Enter your credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Username</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="your_username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Password</FormLabel>
                    <FormControl>
                      <Input type="password" className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {loginUser.isError && (
                <p className="text-sm text-destructive text-center">Invalid username or password.</p>
              )}
              <Button type="submit" className="w-full" disabled={loginUser.isPending}>
                {loginUser.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 flex flex-col gap-2 text-center">
            <button
              type="button"
              onClick={() => onSwitch("forgot")}
              className="text-sm text-zinc-400 hover:text-primary transition-colors"
            >
              Forgot your password?
            </button>
            <p className="text-sm text-zinc-500">
              New to Iron & Forge?{" "}
              <button
                type="button"
                onClick={() => onSwitch("register")}
                className="text-primary hover:underline font-medium"
              >
                Create an account
              </button>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800 text-center">
        <p className="text-zinc-400 text-sm mb-3">Demo Accounts</p>
        <div className="flex flex-wrap justify-center gap-2">
          {(["owner", "manager", "trainer", "customer"] as const).map((role) => (
            <Button key={role} variant="outline" size="sm" onClick={() => setDemo(role)} className="bg-transparent border-zinc-700 text-zinc-300 hover:text-white capitalize">
              {role}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Register ──────────────────────────────────────────────────────────────────

function RegisterView({ onSwitch }: { onSwitch: (v: View) => void }) {
  const { setAuth } = useAuth();
  const [, setLocation] = useLocation();
  const createMember = useCreateMember();
  const createUser = useCreateUser();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", username: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setServerError(null);
    try {
      const member = await createMember.mutateAsync({
        data: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone || null,
          status: "inactive",
          joinDate: new Date().toISOString().split("T")[0],
        },
      });
      const user = await createUser.mutateAsync({
        data: {
          username: values.username,
          password: values.password,
          fullName: `${values.firstName} ${values.lastName}`,
          role: "customer",
          memberId: member.id,
        },
      });
      setAuth({ ...user, memberId: member.id });
      setLocation("/customer/dashboard");
    } catch (err: any) {
      setServerError(err?.message ?? "Registration failed. The username may already be taken.");
    }
  };

  const isPending = createMember.isPending || createUser.isPending;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
      <CardHeader>
        <button type="button" onClick={() => onSwitch("login")} className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm mb-1 transition-colors w-fit">
          <ArrowLeft className="w-3 h-3" /> Back to Sign In
        </button>
        <CardTitle className="text-zinc-100">Create Account</CardTitle>
        <CardDescription className="text-zinc-400">Register as a new member at Iron & Forge.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">First Name</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Last Name</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Email</FormLabel>
                  <FormControl>
                    <Input type="email" className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Phone <span className="text-zinc-500">(optional)</span></FormLabel>
                  <FormControl>
                    <Input className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="+1 (555) 000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Username</FormLabel>
                  <FormControl>
                    <Input className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="john_doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="Min. 6 characters" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="Re-enter password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {serverError && (
              <p className="text-sm text-destructive text-center">{serverError}</p>
            )}
            <Button type="submit" className="w-full mt-2" disabled={isPending}>
              {isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ── Forgot Password ───────────────────────────────────────────────────────────

function ForgotView({ onSwitch }: { onSwitch: (v: View) => void }) {
  const resetPassword = useResetPassword();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { username: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: z.infer<typeof forgotSchema>) => {
    setServerError(null);
    try {
      await resetPassword.mutateAsync({
        data: { username: values.username, newPassword: values.newPassword },
      });
      setDone(true);
    } catch (err: any) {
      setServerError(err?.message ?? "No account found with that username.");
    }
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
      <CardHeader>
        <button type="button" onClick={() => onSwitch("login")} className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm mb-1 transition-colors w-fit">
          <ArrowLeft className="w-3 h-3" /> Back to Sign In
        </button>
        <CardTitle className="text-zinc-100">Reset Password</CardTitle>
        <CardDescription className="text-zinc-400">Enter your username and choose a new password.</CardDescription>
      </CardHeader>
      <CardContent>
        {done ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="p-3 rounded-full bg-primary/10 ring-1 ring-primary/20">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-zinc-100 font-semibold text-lg">Password updated</p>
              <p className="text-zinc-400 text-sm mt-1">You can now sign in with your new password.</p>
            </div>
            <Button className="w-full" onClick={() => onSwitch("login")}>Back to Sign In</Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Username</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="your_username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">New Password</FormLabel>
                    <FormControl>
                      <Input type="password" className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="Min. 6 characters" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="Re-enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {serverError && (
                <p className="text-sm text-destructive text-center">{serverError}</p>
              )}
              <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
                {resetPassword.isPending ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Landing() {
  const { role } = useAuth();
  const [, setLocation] = useLocation();
  const [view, setView] = useState<View>("login");

  useEffect(() => {
    if (role) setLocation(`/${role}/dashboard`);
  }, [role, setLocation]);

  return (
    <Shell>
      {view === "login" && <LoginView onSwitch={setView} />}
      {view === "register" && <RegisterView onSwitch={setView} />}
      {view === "forgot" && <ForgotView onSwitch={setView} />}
    </Shell>
  );
}
