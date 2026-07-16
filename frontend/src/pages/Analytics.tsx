import React from "react";
import { useAnalytics } from "../hooks/useCRM";
import { useTheme } from "../context/ThemeContext";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend, LineChart, Line 
} from "recharts";
import { Download, RefreshCw, BarChart3, TrendingUp, HelpCircle } from "lucide-react";

export const Analytics: React.FC = () => {
  const { theme } = useTheme();
  const { data: report, isLoading, refetch } = useAnalytics();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleExportCSV = () => {
    if (!report) return;

    // Build CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,Key Metric,Value\r\n";
    
    // Summary
    csvContent += `Summary,Total Customers,${report.total_customers}\r\n`;
    csvContent += `Summary,Total Companies,${report.total_companies}\r\n`;
    csvContent += `Summary,Total Revenue,${report.total_revenue}\r\n`;
    csvContent += `Summary,Active Leads Count,${report.active_leads_count}\r\n`;

    // Revenue group
    csvContent += "\r\nCategory,Month,Revenue\r\n";
    report.monthly_revenue.forEach((item: any) => {
      csvContent += `Monthly Revenue,${item.month},${item.revenue}\r\n`;
    });

    // Pipeline group
    csvContent += "\r\nCategory,Pipeline Stage,Lead Count,Pipeline Value\r\n";
    report.sales_pipeline.forEach((item: any) => {
      csvContent += `Pipeline Stages,${item.stage},${item.count},${item.value}\r\n`;
    });

    // Employees performance
    csvContent += "\r\nCategory,Sales Representative,Deals Won,Revenue Generated\r\n";
    report.top_employees.forEach((item: any) => {
      csvContent += `Top Performers,${item.name},${item.deals_won},${item.revenue_generated}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leadflow_analytics_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS = ["#2563EB", "#7C3AED", "#22C55E", "#F59E0B", "#EF4444", "#3B82F6", "#6366F1"];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-zinc-800 rounded" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sales Analytics</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Deep-dive insights into conversion metrics and monthly billing metrics.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-xl"
            title="Refresh Report"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV Spreadsheet
          </button>
        </div>
      </div>

      {/* Trajectories area charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Area Chart */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-soft">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400 mb-6">Revenue Trajectory</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report?.monthly_revenue}>
                <defs>
                  <linearGradient id="colorRevenueAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" style={{ fontSize: 9, fill: theme === "dark" ? "#A1A1AA" : "#94A3B8" }} tickLine={false} axisLine={false} />
                <YAxis style={{ fontSize: 9, fill: theme === "dark" ? "#A1A1AA" : "#94A3B8" }} tickLine={false} axisLine={false} />
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
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenueAnalytics)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Growth Line Chart */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-soft">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400 mb-6">Customer Growth Velocity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report?.customer_growth}>
                <XAxis dataKey="month" style={{ fontSize: 9, fill: theme === "dark" ? "#A1A1AA" : "#94A3B8" }} tickLine={false} axisLine={false} />
                <YAxis style={{ fontSize: 9, fill: theme === "dark" ? "#A1A1AA" : "#94A3B8" }} tickLine={false} axisLine={false} />
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
                <Line type="monotone" dataKey="count" stroke="#7C3AED" strokeWidth={2.5} activeDot={{ r: 6 }} name="Total Customers" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Down charts: Pipeline value and team reps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline stage values */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-soft">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400 mb-6">Pipeline Value Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report?.sales_pipeline} margin={{ left: -10 }}>
                <XAxis dataKey="stage" style={{ fontSize: 9, fill: theme === "dark" ? "#A1A1AA" : "#94A3B8" }} tickLine={false} axisLine={false} />
                <YAxis style={{ fontSize: 9, fill: theme === "dark" ? "#A1A1AA" : "#94A3B8" }} tickLine={false} axisLine={false} />
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
                <Bar dataKey="value" fill="#22C55E" radius={[4, 4, 0, 0]} name="Deals Value ($)">
                  {(report?.sales_pipeline || []).map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Reps */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-soft">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400 mb-6">Sales Agent Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report?.top_employees} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" style={{ fontSize: 9, fill: theme === "dark" ? "#A1A1AA" : "#94A3B8" }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" style={{ fontSize: 9, fill: theme === "dark" ? "#A1A1AA" : "#94A3B8" }} tickLine={false} axisLine={false} />
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
                <Legend />
                <Bar dataKey="deals_won" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Deals Won" />
                <Bar dataKey="revenue_generated" fill="#10B981" radius={[0, 4, 4, 0]} name="Revenue Earned ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
