import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Mail, Lock, AlertCircle, RefreshCw } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      setSessionExpired(true);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setLoginError(null);
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-zinc-200 flex items-center justify-center p-6 relative">
      {/* Background blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl transition-all">
        {/* Title branding */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex w-10 h-10 rounded-xl bg-blue-600 items-center justify-center font-bold text-white shadow-md mx-auto">
            LF
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Log in to manage your pipeline</p>
        </div>

        {/* Expired warning */}
        {sessionExpired && (
          <div className="mb-6 p-3.5 rounded-xl border border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-900/10 flex items-start gap-2.5 text-xs text-yellow-800 dark:text-yellow-300">
            <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">Your session has expired. Please log in again to continue.</p>
          </div>
        )}

        {/* API Error Warning */}
        {loginError && (
          <div className="mb-6 p-3.5 rounded-xl border border-red-500/30 bg-red-50/50 dark:bg-red-900/10 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-300">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{loginError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 absolute left-3.5" />
              <input
                type="email"
                placeholder="you@company.com"
                {...register("email")}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-600 text-slate-900 dark:text-zinc-100"
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-red-500 font-semibold leading-none">{errors.email.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Password</label>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 absolute left-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-600 text-slate-900 dark:text-zinc-100"
              />
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-500 font-semibold leading-none">{errors.password.message}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/60 font-bold text-white rounded-xl text-sm transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Sign In"}
          </button>
        </form>

        {/* Demo Accounts Panel for instant onboarding */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 text-center space-y-3">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Demo Accounts</p>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
            <div className="text-left">
              <span className="font-bold text-slate-700 dark:text-zinc-300 block">Admin</span>
              admin@leadflow.com<br />
              AdminPassword123
            </div>
            <div className="text-left border-l border-slate-200 dark:border-zinc-800 pl-3">
              <span className="font-bold text-slate-700 dark:text-zinc-300 block">Sales Executive</span>
              sarah@leadflow.com<br />
              SarahPassword123
            </div>
          </div>
        </div>

        {/* Register link */}
        <div className="mt-6 text-center text-xs">
          <span className="text-slate-400 dark:text-zinc-500 font-medium">Don't have an account? </span>
          <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};
