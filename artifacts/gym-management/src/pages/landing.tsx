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
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

const registerSchema = z.object({
  firstName: z.string().min(1, "Vui lòng nhập tên"),
  lastName: z.string().min(1, "Vui lòng nhập họ"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  phone: z.string().optional(),
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

const forgotSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
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
          <CardTitle className="text-zinc-100">Đăng Nhập</CardTitle>
          <CardDescription className="text-zinc-400">Nhập thông tin đăng nhập để tiếp tục.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="ten_dang_nhap" {...field} />
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
                    <FormLabel className="text-zinc-300">Mật khẩu</FormLabel>
                    <FormControl>
                      <Input type="password" className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {loginUser.isError && (
                <p className="text-sm text-destructive text-center">Tên đăng nhập hoặc mật khẩu không đúng.</p>
              )}
              <Button type="submit" className="w-full" disabled={loginUser.isPending}>
                {loginUser.isPending ? "Đang đăng nhập..." : "Đăng Nhập"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 flex flex-col gap-2 text-center">
            <button
              type="button"
              onClick={() => onSwitch("forgot")}
              className="text-sm text-zinc-400 hover:text-primary transition-colors"
            >
              Quên mật khẩu?
            </button>
            <p className="text-sm text-zinc-500">
              Bạn mới biết đến Iron & Forge?{" "}
              <button
                type="button"
                onClick={() => onSwitch("register")}
                className="text-primary hover:underline font-medium"
              >
                Tạo tài khoản
              </button>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800 text-center">
        <p className="text-zinc-400 text-sm mb-3">Tài khoản Demo</p>
        <div className="flex flex-wrap justify-center gap-2">
          {(["owner", "manager", "trainer", "customer"] as const).map((role) => (
            <Button key={role} variant="outline" size="sm" onClick={() => setDemo(role)} className="bg-transparent border-zinc-700 text-zinc-300 hover:text-white capitalize">
              {role === "owner" ? "chủ phòng" : role === "manager" ? "quản lý" : role === "trainer" ? "HLV (PT)" : "hội viên"}
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
      setServerError(err?.message ?? "Đăng ký thất bại. Tên đăng nhập này có thể đã được sử dụng.");
    }
  };

  const isPending = createMember.isPending || createUser.isPending;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
      <CardHeader>
        <button type="button" onClick={() => onSwitch("login")} className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm mb-1 transition-colors w-fit">
          <ArrowLeft className="w-3 h-3" /> Quay lại Đăng nhập
        </button>
        <CardTitle className="text-zinc-100">Đăng Ký Tài Khoản</CardTitle>
        <CardDescription className="text-zinc-400">Đăng ký thành viên mới tại Iron & Forge.</CardDescription>
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
                    <FormLabel className="text-zinc-300">Tên</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="Tên" {...field} />
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
                    <FormLabel className="text-zinc-300">Họ</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="Họ và tên đệm" {...field} />
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
                    <Input type="email" className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="example@email.com" {...field} />
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
                  <FormLabel className="text-zinc-300">Số điện thoại <span className="text-zinc-500">(tùy chọn)</span></FormLabel>
                  <FormControl>
                    <Input className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="0901234567" {...field} />
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
                  <FormLabel className="text-zinc-300">Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="username" {...field} />
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
                  <FormLabel className="text-zinc-300">Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="Tối thiểu 6 ký tự" {...field} />
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
                  <FormLabel className="text-zinc-300">Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="Nhập lại mật khẩu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {serverError && (
              <p className="text-sm text-destructive text-center">{serverError}</p>
            )}
            <Button type="submit" className="w-full mt-2" disabled={isPending}>
              {isPending ? "Đang tạo tài khoản..." : "Đăng Ký"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// ── Forgot Password ───────────────────────────────────────────

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
      setServerError(err?.message ?? "Không tìm thấy tài khoản với tên đăng nhập này.");
    }
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
      <CardHeader>
        <button type="button" onClick={() => onSwitch("login")} className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm mb-1 transition-colors w-fit">
          <ArrowLeft className="w-3 h-3" /> Quay lại Đăng nhập
        </button>
        <CardTitle className="text-zinc-100">Đặt Lại Mật Khẩu</CardTitle>
        <CardDescription className="text-zinc-400">Nhập tên đăng nhập của bạn và chọn mật khẩu mới.</CardDescription>
      </CardHeader>
      <CardContent>
        {done ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="p-3 rounded-full bg-primary/10 ring-1 ring-primary/20">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-zinc-100 font-semibold text-lg">Mật khẩu đã được cập nhật</p>
              <p className="text-zinc-400 text-sm mt-1">Bây giờ bạn có thể đăng nhập bằng mật khẩu mới của mình.</p>
            </div>
            <Button className="w-full" onClick={() => onSwitch("login")}>Quay lại Đăng nhập</Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="ten_dang_nhap" {...field} />
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
                    <FormLabel className="text-zinc-300">Mật khẩu mới</FormLabel>
                    <FormControl>
                      <Input type="password" className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="Tối thiểu 6 ký tự" {...field} />
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
                    <FormLabel className="text-zinc-300">Xác nhận mật khẩu mới</FormLabel>
                    <FormControl>
                      <Input type="password" className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="Nhập lại mật khẩu mới" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {serverError && (
                <p className="text-sm text-destructive text-center">{serverError}</p>
              )}
              <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
                {resetPassword.isPending ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
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
