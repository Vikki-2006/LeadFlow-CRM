import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Components & Layout
import { DashboardLayout } from "./components/DashboardLayout";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Customers } from "./pages/Customers";
import { CustomerDetails } from "./pages/CustomerDetails";
import { Companies } from "./pages/Companies";
import { CompanyDetails } from "./pages/CompanyDetails";
import { Leads } from "./pages/Leads";
import { Tasks } from "./pages/Tasks";
import { Meetings } from "./pages/Meetings";
import { Analytics } from "./pages/Analytics";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { Users } from "./pages/Users";
import { Loader2 } from "lucide-react";

import { ThemeProvider } from "./context/ThemeContext";

// Initialize TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Wrapper (checks authentication)
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Admin-only Route Wrapper (checks role)
const AdminRoute: React.FC = () => {
  const { user } = useAuth();
  return user?.role === "Admin" ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Workspace Layout */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="customers/:id" element={<CustomerDetails />} />
                  <Route path="companies" element={<Companies />} />
                  <Route path="companies/:id" element={<CompanyDetails />} />
                  <Route path="leads" element={<Leads />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="meetings" element={<Meetings />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  
                  {/* Admin Only routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="users" element={<Users />} />
                  </Route>
                </Route>
              </Route>

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
