import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/samayak/Button";
import { Input } from "@/components/samayak/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/samayak/Card";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Samayak Admin" },
      { name: "description", content: "Sign in to the Samayak Admin Panel." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        toast.success("Successfully logged in!");
        navigate({ to: "/" });
      } else {
        toast.error("Login response was invalid.");
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || "Login failed. Please check your credentials.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("admin@samayak.com");
    setPassword("admin123");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-[420px] shadow-lg animate-in fade-in duration-500">
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-deep to-brand-blue text-white shadow-md">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-ink">
            Samayak Admin Panel
          </CardTitle>
          <p className="text-sm text-muted mt-1.5">
            Sign in to manage departments, rooms, and courses
          </p>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-soft flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-brand-blue" />
                Email Address
              </label>
              <Input
                type="email"
                required
                placeholder="admin@samayak.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink-soft flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-brand-blue" />
                Password
              </label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full mt-4 font-bold tracking-wide" isLoading={isLoading}>
              Sign In
            </Button>

            <div className="rounded-md border border-line-2 bg-canvas-2/60 px-4 py-3 text-xs text-ink-soft">
              <div className="font-semibold text-ink mb-1">Demo login</div>
              <div className="font-mono">admin@samayak.com · admin123</div>
              <button
                type="button"
                onClick={fillDemo}
                className="mt-2 text-brand-deep font-bold hover:underline"
              >
                Fill demo credentials →
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
