"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Wrench, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid username or password. Please check credentials.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        username: user,
        password: pass,
        redirect: false,
      });
      if (!res?.error) {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative gradient backdrops */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/80">
        {/* Brand Header */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-100">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Wrench className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              SKANDER SPARE PARTS
            </h1>
            <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
              Shop Management Software • Karachi
            </p>
            <p className="text-xs text-blue-600 font-semibold mt-1">
              اسٹاف اور ایڈمن لاگ ان
            </p>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <Input
              label="Username / موبائل یا یوزر"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin / staff / sohail"
              required
            />
          </div>

          <div className="relative">
            <Input
              label="Password / پاس ورڈ"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={loading}
            className="w-full font-bold shadow-md mt-2"
          >
            Sign In to Shop (لاگ ان کریں)
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </form>

        {/* 1-Click Quick Demo Login credentials */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            Quick 1-Click Demo Login
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin", "admin123")}
              className="p-2.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-blue-50 hover:border-blue-300 text-slate-700 font-semibold transition text-left"
            >
              <div className="text-blue-700 font-bold">Admin Portal</div>
              <div className="text-[10px] text-slate-400">admin / admin123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("staff", "staff123")}
              className="p-2.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-blue-50 hover:border-blue-300 text-slate-700 font-semibold transition text-left"
            >
              <div className="text-emerald-700 font-bold">Counter Staff</div>
              <div className="text-[10px] text-slate-400">staff / staff123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
