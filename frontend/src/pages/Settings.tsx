import React, { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { 
  Sun, Moon, Bell, Monitor, Lock, Shield, 
  HelpCircle, RefreshCw 
} from "lucide-react";

export const Settings: React.FC = () => {
  const { success } = useToast();
  const { theme: themeMode, setTheme } = useTheme();
  
  const [leadNotif, setLeadNotif] = useState(true);
  const [meetingNotif, setMeetingNotif] = useState(true);
  const [taskNotif, setTaskNotif] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    success(`Theme changed to ${newTheme} mode`);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      success("Settings updated successfully", "Preferences Saved");
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Manage LeadFlow system notifications, visual themes, and local keys.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Visual Appearance theme */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-soft space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Visual Appearance</h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">Customize the color theme scheme of LeadFlow.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleThemeChange("light")}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                themeMode === "light" 
                  ? "border-blue-500 bg-blue-50/20 dark:bg-zinc-800" 
                  : "border-slate-200 dark:border-zinc-850 hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-blue-500" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">Light Mode</span>
                  <span className="text-[10px] text-slate-500">Minimal and bright</span>
                </div>
              </div>
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${themeMode === "light" ? "border-blue-500" : "border-slate-300"}`}>
                {themeMode === "light" && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleThemeChange("dark")}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                themeMode === "dark" 
                  ? "border-blue-500 bg-blue-900/10 dark:bg-zinc-850" 
                  : "border-slate-200 dark:border-zinc-850 hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-purple-500" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">Dark Mode</span>
                  <span className="text-[10px] text-slate-500">Sleek and easy on the eyes</span>
                </div>
              </div>
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${themeMode === "dark" ? "border-blue-500" : "border-slate-300"}`}>
                {themeMode === "dark" && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
              </span>
            </button>
          </div>
        </div>

        {/* Notifications Checkboxes */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <Bell className="w-4.5 h-4.5 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Alert Preferences</h3>
          </div>

          <div className="space-y-4.5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={leadNotif}
                onChange={(e) => setLeadNotif(e.target.checked)}
                className="mt-0.5 w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs leading-normal">
                <span className="font-bold text-slate-800 dark:text-zinc-200 block group-hover:text-blue-600 transition-colors">
                  New Lead Assigned
                </span>
                <p className="text-slate-500 dark:text-zinc-400 font-medium mt-0.5">Receive in-app alerts when a deal opportunity gets linked to your account.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={meetingNotif}
                onChange={(e) => setMeetingNotif(e.target.checked)}
                className="mt-0.5 w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs leading-normal">
                <span className="font-bold text-slate-800 dark:text-zinc-200 block group-hover:text-blue-600 transition-colors">
                  Meeting Reminders
                </span>
                <p className="text-slate-500 dark:text-zinc-400 font-medium mt-0.5">Alert me 15 minutes before scheduled meetings and client calendars begin.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={taskNotif}
                onChange={(e) => setTaskNotif(e.target.checked)}
                className="mt-0.5 w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs leading-normal">
                <span className="font-bold text-slate-800 dark:text-zinc-200 block group-hover:text-blue-600 transition-colors">
                  Task Due Reminder
                </span>
                <p className="text-slate-500 dark:text-zinc-400 font-medium mt-0.5">Receive daily summaries of checklist tasks that are overdue or nearing targets.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Account settings summary information */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <Shield className="w-4.5 h-4.5 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Overview</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold leading-tight">API Server</span>
              <span className="text-slate-850 dark:text-zinc-200 mt-1 block">Active (v1.0.0)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold leading-tight">License Tier</span>
              <span className="text-slate-850 dark:text-zinc-200 mt-1 block">Enterprise Trial</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Save All Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
