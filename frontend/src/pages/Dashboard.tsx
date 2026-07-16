import React from "react";
import { useAnalytics, useActivities, useMeetings } from "../hooks/useCRM";
import { useTheme } from "../context/ThemeContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { 
  Users, Building, GitBranch, DollarSign, 
  Plus, Calendar, CheckSquare, Clock, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: activities = [], isLoading: activitiesLoading } = useActivities(6);
  const { data: meetings = [], isLoading: meetingsLoading } = useMeetings();

  // Pick upcoming meetings (max 4)
  const upcomingMeetings = meetings
    .filter(m => new Date(m.time) > new Date())
    .slice(0, 4);

  // Formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  const statCards = [
    {
      title: "Total Customers",
      value: analytics?.total_customers,
      icon: Users,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
      link: "/dashboard/customers"
    },
    {
      title: "Assigned Companies",
      value: analytics?.total_companies,
      icon: Building,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
      link: "/dashboard/companies"
    },
    {
      title: "Active Leads",
      value: analytics?.active_leads_count,
      icon: GitBranch,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
      link: "/dashboard/leads"
    },
    {
      title: "Revenue Generated",
      value: analytics?.total_revenue ? formatCurrency(analytics.total_revenue) : undefined,
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
      link: "/dashboard/analytics"
    }
  ];

  const COLORS = ["#2563EB", "#7C3AED", "#22C55E", "#F59E0B", "#EF4444", "#3B82F6", "#6366F1"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Welcome to LeadFlow. Here is your overview.</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Link
            to="/dashboard/customers"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Customer
          </Link>
          <Link
            to="/dashboard/leads"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-white transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </Link>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl flex items-center justify-between shadow-soft hover:shadow-md transition-all group">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{stat.title}</span>
                {analyticsLoading ? (
                  <div className="h-7 w-20 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-lg mt-1" />
                ) : (
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {stat.value ?? 0}
                  </p>
                )}
                <Link to={stat.link} className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 inline-flex items-center gap-0.5 group-hover:underline mt-1">
                  View details <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-soft">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Revenue Growth</h2>
          <div className="h-72 w-full">
            {analyticsLoading ? (
              <div className="w-full h-full bg-slate-50 dark:bg-zinc-950 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.monthly_revenue} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: 10, fill: theme === "dark" ? "#A1A1AA" : "#94A3B8" }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: theme === "dark" ? "#A1A1AA" : "#94A3B8" }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: theme === "dark" ? "#18181B" : "rgba(255,255,255,0.9)", 
                      borderRadius: 12, 
                      border: theme === "dark" ? "1px solid #27272A" : "1px solid #E2E8F0",
                      fontSize: 12,
                    }} 
                    labelStyle={{ color: theme === "dark" ? "#71717A" : "#64748B" }}
                    itemStyle={{ color: theme === "dark" ? "#F4F4F5" : "#0F172A" }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Lead Status Distribution (Bar Chart) */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-soft">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Lead Conversions</h2>
          <div className="h-72 w-full">
            {analyticsLoading ? (
              <div className="w-full h-full bg-slate-50 dark:bg-zinc-950 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.lead_conversion_rate} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="status" tickLine={false} axisLine={false} style={{ fontSize: 9, fill: theme === "dark" ? "#A1A1AA" : "#94A3B8" }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: theme === "dark" ? "#A1A1AA" : "#94A3B8" }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: theme === "dark" ? "#18181B" : "rgba(255,255,255,0.9)", 
                      borderRadius: 12, 
                      border: theme === "dark" ? "1px solid #27272A" : "1px solid #E2E8F0",
                      fontSize: 12,
                    }} 
                    labelStyle={{ color: theme === "dark" ? "#71717A" : "#64748B" }}
                    itemStyle={{ color: theme === "dark" ? "#F4F4F5" : "#0F172A" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Leads">
                    {(analytics?.lead_conversion_rate || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Down section: Activities & Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Timeline */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-soft flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-5">Recent Activities</h2>
          
          <div className="flex-1 space-y-4">
            {activitiesLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 items-start animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800" />
                  <div className="flex-1 space-y-1.5 mt-1">
                    <div className="h-3 w-1/3 bg-slate-100 dark:bg-zinc-800 rounded" />
                    <div className="h-3.5 w-2/3 bg-slate-100 dark:bg-zinc-800 rounded" />
                  </div>
                </div>
              ))
            ) : activities.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 dark:text-zinc-500">
                No recent activity logged
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="flex gap-3 items-start text-xs leading-relaxed group">
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex items-center justify-center text-slate-400 font-bold shrink-0">
                    {act.user?.name.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-1">
                      <span className="font-bold text-slate-900 dark:text-white text-xs truncate">{act.action}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5 font-medium leading-normal">{act.details}</p>
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">by {act.user?.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-soft flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Meetings</h2>
            <Link to="/dashboard/meetings" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              View calendar
            </Link>
          </div>

          <div className="flex-1 space-y-3.5">
            {meetingsLoading ? (
              [1, 2].map(i => (
                <div key={i} className="flex gap-3 items-start animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800" />
                  <div className="flex-1 space-y-1.5 mt-1">
                    <div className="h-3.5 w-1/2 bg-slate-100 dark:bg-zinc-800 rounded" />
                    <div className="h-3 w-1/4 bg-slate-100 dark:bg-zinc-800 rounded" />
                  </div>
                </div>
              ))
            ) : upcomingMeetings.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 dark:text-zinc-500 flex flex-col items-center justify-center gap-2">
                <Calendar className="w-8 h-8 text-slate-300 dark:text-zinc-700" />
                <span>No meetings scheduled</span>
              </div>
            ) : (
              upcomingMeetings.map((meet) => {
                const meetDate = new Date(meet.time);
                return (
                  <div key={meet.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/10 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase leading-none">
                          {meetDate.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white leading-none mt-1">
                          {meetDate.getDate()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{meet.title}</h4>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          With {meet.customer?.name || "Client"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-1.5 text-xs text-slate-500 font-semibold shrink-0">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {meetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
