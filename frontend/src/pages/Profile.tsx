import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import { User, Phone, Mail, Key, Shield, RefreshCw } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().nullable(),
  email: z.string().email("Enter a valid email address"),
});

const passwordSchema = z.object({
  old_password: z.string().min(6, "Password must be at least 6 characters"),
  new_password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.new_password === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormType = z.infer<typeof profileSchema>;
type PasswordFormType = z.infer<typeof passwordSchema>;

export const Profile: React.FC = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const { success, error } = useToast();
  
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormType>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormType>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormType) => {
    setProfileSaving(true);
    try {
      const response = await api.put("/auth/me", data);
      updateUser(response.data);
      success("Profile details updated successfully", "Profile Saved");
    } catch (err: any) {
      error(err.response?.data?.detail || "Failed to update profile details");
    } finally {
      setProfileSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormType) => {
    setPasswordSaving(true);
    try {
      await api.put("/auth/me/password", {
        old_password: data.old_password,
        new_password: data.new_password,
      });
      success("Your password has been changed securely", "Password Updated");
      resetPassword({ old_password: "", new_password: "", confirmPassword: "" });
    } catch (err: any) {
      error(err.response?.data?.detail || "Incorrect old password");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account Profile</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Configure your profile details and change account settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card - User Preview */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-soft text-center space-y-4 self-start">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-black text-2xl mx-auto border border-blue-200/50 dark:border-blue-900/25">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{user?.name}</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">{user?.role}</p>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <Shield className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Active Agent</span>
          </div>
        </div>

        {/* Right Tab columns */}
        <div className="md:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-soft space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-slate-400" />
              General Details
            </h3>
            
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Full Name</label>
                  <input
                    type="text"
                    {...registerProfile("name")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-850 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                  {profileErrors.name && (
                    <span className="text-[10px] text-red-500 font-semibold">{profileErrors.name.message}</span>
                  )}
                </div>
                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Phone</label>
                  <input
                    type="text"
                    {...registerProfile("phone")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-850 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Email Address</label>
                <input
                  type="email"
                  {...registerProfile("email")}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-850 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                />
                {profileErrors.email && (
                  <span className="text-[10px] text-red-500 font-semibold">{profileErrors.email.message}</span>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 font-bold text-xs flex items-center gap-1.5"
                >
                  {profileSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save Details
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-soft space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4.5 h-4.5 text-slate-400" />
              Security & Credentials
            </h3>

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              {/* Old password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword("old_password")}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-850 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                />
                {passwordErrors.old_password && (
                  <span className="text-[10px] text-red-500 font-semibold">{passwordErrors.old_password.message}</span>
                )}
              </div>

              {/* New passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword("new_password")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-850 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                  {passwordErrors.new_password && (
                    <span className="text-[10px] text-red-500 font-semibold">{passwordErrors.new_password.message}</span>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword("confirmPassword")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-850 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                  {passwordErrors.confirmPassword && (
                    <span className="text-[10px] text-red-500 font-semibold">{passwordErrors.confirmPassword.message}</span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                >
                  {passwordSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
