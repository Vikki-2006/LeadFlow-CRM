import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  GitBranch, ShieldCheck, BarChart3, Clock, 
  Users, CheckCircle2, Building, MessageSquare,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300">
      {/* Header */}
      <header className="h-20 px-6 max-w-7xl w-full mx-auto flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            LF
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
            LeadFlow<span className="text-blue-600">.</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-sm font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 max-w-6xl mx-auto text-center flex-1 flex flex-col justify-center items-center">
        {/* Decorative Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200/60 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            Introducing LeadFlow 2.0
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Close More Deals.<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Supercharge Your Sales.
            </span>
          </h1>
          <p className="text-base sm:text-xl text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
            LeadFlow is the modern, collaborative CRM built for high-growth teams. Easily coordinate contacts, manage deals, track activities, and review advanced sales analytics.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all text-sm group"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-sm transition-all"
          >
            Learn More
          </a>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 border-t border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Built for High-Velocity Teams</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">Everything you need to accelerate pipeline velocity and scale client relationships.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pipeline Management</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                Track leads across custom stages: from contacted to proposal and contract won. Stay aligned on priority and expected close dates.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Contact & Company Profiles</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                Keep all client details in one centralized location. Group contacts by companies, schedule next activities, and record meeting notes.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sales Insights & Analytics</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                Analyze conversion funnels, monthly revenue trajectories, customer counts, and sales agent performance over customizable dates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="py-24 px-6 border-t border-slate-100 dark:border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Simple, Transparent Pricing</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">No hidden fees or complex setups. Scale LeadFlow as your team grows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-soft">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Standard</h3>
                  <p className="text-xs text-slate-400 mt-1">Perfect for small teams and solopreneurs.</p>
                </div>
                <div className="flex items-baseline text-slate-900 dark:text-white">
                  <span className="text-4xl font-extrabold tracking-tight">$0</span>
                  <span className="ml-1 text-sm font-semibold text-slate-400">/month</span>
                </div>
                <ul className="space-y-3.5">
                  {["1 user account", "Up to 50 customers", "Basic Pipeline Board", "Log meetings & tasks", "Community support"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-zinc-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <Link 
                to="/register"
                className="mt-8 block w-full py-2.5 rounded-xl text-center text-xs font-bold border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-white transition-all"
              >
                Sign up free
              </Link>
            </div>

            {/* Pro */}
            <div className="p-8 rounded-2xl border-2 border-blue-500 bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-xl relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-bold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider">
                Popular
              </span>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Enterprise Pro</h3>
                  <p className="text-xs text-slate-400 mt-1">For growing sales teams needing analytics.</p>
                </div>
                <div className="flex items-baseline text-slate-900 dark:text-white">
                  <span className="text-4xl font-extrabold tracking-tight">$29</span>
                  <span className="ml-1 text-sm font-semibold text-slate-400">/user/month</span>
                </div>
                <ul className="space-y-3.5">
                  {["Unlimited team users", "Unlimited customers & companies", "Drag-and-drop Pipeline stages", "Full analytical charts", "Priority admin roles", "24/7 dedicated support"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-zinc-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-8 block w-full py-2.5 rounded-xl text-center text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-900 py-12 px-6 shrink-0 mt-auto bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
              LF
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">LeadFlow CRM</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
            © {new Date().getFullYear()} LeadFlow Inc. All rights reserved. Portfolio demonstration.
          </p>
        </div>
      </footer>
    </div>
  );
};
