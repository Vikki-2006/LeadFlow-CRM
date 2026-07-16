import React, { useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "../hooks/useCRM";
import { 
  LayoutDashboard, Users, Building2, GitBranch, CheckSquare, 
  Calendar, BarChart3, Bell, Moon, Sun, LogOut, Menu, X, 
  Search, ShieldAlert, User as UserIcon, Settings as SettingsIcon,
  ChevronDown
} from "lucide-react";

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const { data: notifications = [] } = useNotifications();
  const markReadMut = useMarkNotificationRead();
  const markAllReadMut = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Customers", path: "/dashboard/customers", icon: Users },
    { name: "Companies", path: "/dashboard/companies", icon: Building2 },
    { name: "Lead Pipeline", path: "/dashboard/leads", icon: GitBranch },
    { name: "Tasks", path: "/dashboard/tasks", icon: CheckSquare },
    { name: "Meetings", path: "/dashboard/meetings", icon: Calendar },
    { name: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
    ...(user?.role === "Admin" ? [{ name: "Manage Users", path: "/dashboard/users", icon: ShieldAlert }] : []),
  ];

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/dashboard/customers?search=${encodeURIComponent(globalSearch)}`);
      setGlobalSearch("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-zinc-200 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center border-b border-slate-100 dark:border-zinc-800 gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            LF
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            LeadFlow<span className="text-blue-600">.</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive 
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-zinc-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card footer */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-white leading-tight">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Navbar */}
        <header className="h-16 border-b border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Trigger */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <form onSubmit={handleGlobalSearchSubmit} className="hidden sm:flex items-center relative max-w-sm w-full">
              <Search className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 absolute left-3" />
              <input
                type="text"
                placeholder="Search customers..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-600 text-slate-900 dark:text-zinc-100"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications Tray */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[10px] text-white font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => markAllReadMut.mutate()}
                          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400 dark:text-zinc-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              if (!notif.is_read) markReadMut.mutate(notif.id);
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-3.5 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer ${!notif.is_read ? "bg-blue-50/30 dark:bg-blue-900/5" : ""}`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{notif.title}</h4>
                              <span className="text-[9px] text-slate-400">{new Date(notif.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">{notif.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full md:rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {user?.name.charAt(0)}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden z-50 py-1">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-zinc-800 md:hidden">
                      <p className="text-xs font-semibold truncate text-slate-900 dark:text-white">{user?.name}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.role}</p>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      My Profile
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-400" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-t border-slate-100 dark:border-zinc-800/60"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-zinc-950">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Navigation overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 z-50 flex flex-col transform transition-transform duration-300">
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
                  LF
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                  LeadFlow
                </span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                        : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                  {user?.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-slate-900 dark:text-white max-w-[120px]">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};
