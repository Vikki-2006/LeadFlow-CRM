import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Mail, Lock, User, Phone, RefreshCw, AlertCircle, ShieldAlert } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  role: z.enum(["Admin", "Sales Executive"]).default("Sales Executive"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterSchemaType = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterSchemaType) => {
    setLoading(true);
    setRegError(null);
    try {
      // 1. Call Register API
      await api.post("/auth/register", {
        email: data.email,
        name: data.name,
        phone: data.phone || null,
        role: data.role,
        password: data.password,
        is_active: true,
      });

      success("Account created successfully. Logging you in...", "Registration Complete");
      
      // 2. Automate login on success
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (err: any) {
      setRegError(err.response?.data?.detail || "Registration failed. Try a different email.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-zinc-200 flex items-center justify-center p-6 relative">
      <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex w-10 h-10 rounded-xl bg-blue-600 items-center justify-center font-bold text-white shadow-md mx-auto">
            LF
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Get started with LeadFlow CRM today</p>
        </div>

        {/* API error warning */}
        {regError && (
          <div className="mb-5 p-3.5 rounded-xl border border-red-500/30 bg-red-50/50 dark:bg-red-900/10 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-300">
            <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{regError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Full Name</label>
            <div className="relative flex items-center">
              <User className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 absolute left-3.5" />
              <input
                type="text"
                placeholder="Sarah Jenkins"
                {...register("name")}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-2.2 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-600 text-slate-900 dark:text-zinc-100"
              />
            </div>
            {errors.name && (
              <span className="text-[10px] text-red-500 font-semibold leading-none">{errors.name.message}</span>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 absolute left-3.5" />
              <input
                type="email"
                placeholder="sarah@leadflow.com"
                {...register("email")}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-2.2 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-600 text-slate-900 dark:text-zinc-100"
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-red-500 font-semibold leading-none">{errors.email.message}</span>
            )}
          </div>

          {/* Phone (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Phone Number (Optional)</label>
            <div className="relative flex items-center">
              <Phone className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 absolute left-3.5" />
              <input
                type="text"
                placeholder="555-0199"
                {...register("phone")}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-2.2 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-600 text-slate-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* User Role */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Role</label>
            <div className="relative flex items-center">
              <ShieldAlert className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 absolute left-3.5 pointer-events-none" />
              <select
                {...register("role")}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-2.2 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-600 text-slate-950 dark:text-zinc-100 appearance-none font-semibold cursor-pointer"
              >
                <option value="Sales Executive">Sales Executive</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 absolute left-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-2.2 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-600 text-slate-900 dark:text-zinc-100"
              />
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-500 font-semibold leading-none">{errors.password.message}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Confirm Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 absolute left-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 py-2.2 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-600 text-slate-900 dark:text-zinc-100"
              />
            </div>
            {errors.confirmPassword && (
              <span className="text-[10px] text-red-500 font-semibold leading-none">{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/60 font-bold text-white rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <span className="text-slate-400 dark:text-zinc-500 font-medium">Already have an account? </span>
          <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};
