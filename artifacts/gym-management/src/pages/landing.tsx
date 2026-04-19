import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { useEffect } from "react";
import { useLoginUser } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function Landing() {
  const { role, setAuth } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (role) {
      setLocation(`/${role}/dashboard`);
    }
  }, [role, setLocation]);

  const loginUser = useLoginUser();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
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

  const setDemoLogin = (username: string) => {
    form.setValue("username", username);
    form.setValue("password", "admin123");
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-zinc-950/0 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')] bg-cover bg-center opacity-[0.03] mix-blend-overlay" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6 ring-1 ring-primary/20">
            <Building2 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
            IRON & FORGE
          </h1>
          <p className="text-zinc-400">
            Sign in to the control room.
          </p>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl mb-8">
          <CardHeader>
            <CardTitle className="text-zinc-100">Sign In</CardTitle>
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
                        <Input className="bg-zinc-800/50 border-zinc-700 text-zinc-100" placeholder="admin" {...field} />
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
                <Button type="submit" className="w-full" disabled={loginUser.isPending}>
                  {loginUser.isPending ? "Signing in..." : "Sign In"}
                </Button>
                {loginUser.isError && (
                  <p className="text-sm text-destructive mt-2 text-center">Invalid credentials</p>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800 text-center">
          <p className="text-zinc-400 text-sm mb-3">Demo Accounts</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setDemoLogin("owner")} className="bg-transparent border-zinc-700 text-zinc-300 hover:text-white">Owner</Button>
            <Button variant="outline" size="sm" onClick={() => setDemoLogin("manager")} className="bg-transparent border-zinc-700 text-zinc-300 hover:text-white">Manager</Button>
            <Button variant="outline" size="sm" onClick={() => setDemoLogin("trainer")} className="bg-transparent border-zinc-700 text-zinc-300 hover:text-white">Trainer</Button>
            <Button variant="outline" size="sm" onClick={() => setDemoLogin("customer")} className="bg-transparent border-zinc-700 text-zinc-300 hover:text-white">Customer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
