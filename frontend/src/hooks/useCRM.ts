import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";

// --- Types ---
export interface Note {
  id: number;
  content: string;
  customer_id?: number;
  lead_id?: number;
  company_id?: number;
  user_id: number;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface Company {
  id: number;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  company_id?: number;
  job_title?: string;
  status: string;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface Lead {
  id: number;
  name: string;
  value: number;
  priority: "Low" | "Medium" | "High";
  status: "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";
  expected_closing_date?: string;
  customer_id?: number;
  company_id?: number;
  assigned_employee_id?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  company?: Company;
  assigned_employee?: {
    name: string;
    email: string;
  };
}

export interface CRMTask {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority: "Low" | "Medium" | "High";
  is_completed: boolean;
  assigned_user_id: number;
  customer_id?: number;
  lead_id?: number;
  created_at: string;
  updated_at: string;
  assigned_user?: {
    name: string;
    email: string;
  };
  customer?: Customer;
  lead?: Lead;
}

export interface Meeting {
  id: number;
  title: string;
  description?: string;
  time: string;
  notes?: string;
  customer_id?: number;
  assigned_user_id: number;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  assigned_user?: {
    name: string;
    email: string;
  };
}

export interface CRMActivity {
  id: number;
  action: string;
  details?: string;
  user_id: number;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface CRMNotification {
  id: number;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  user_id: number;
  created_at: string;
}

// --- Hooks ---

// 1. Companies Hooks
export const useCompanies = (search = "", page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["companies", search, page, limit],
    queryFn: async () => {
      const { data } = await api.get<{ items: Company[]; total: number; page: number; pages: number }>("/companies", {
        params: { search, page, limit },
      });
      return data;
    },
  });
};

export const useCompany = (id?: number) => {
  return useQuery({
    queryKey: ["company", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<Company>(`/companies/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (company: Omit<Company, "id" | "created_at" | "updated_at">) => {
      const { data } = await api.post<Company>("/companies", company);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      success("Company created successfully");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to create company");
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...company }: Partial<Company> & { id: number }) => {
      const { data } = await api.put<Company>(`/companies/${id}`, company);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      success("Company updated successfully");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to update company");
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/companies/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      success("Company deleted successfully");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to delete company");
    },
  });
};

// 2. Customers Hooks
export const useCustomers = (search = "", status = "", companyId?: number, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["customers", search, status, companyId, page, limit],
    queryFn: async () => {
      const { data } = await api.get<{ items: Customer[]; total: number; page: number; pages: number }>("/customers", {
        params: { search, status, company_id: companyId, page, limit },
      });
      return data;
    },
  });
};

export const useCustomer = (id?: number) => {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<Customer>(`/customers/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCustomerNotes = (customerId?: number) => {
  return useQuery({
    queryKey: ["customerNotes", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data } = await api.get<Note[]>(`/customers/${customerId}/notes`);
      return data;
    },
    enabled: !!customerId,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (customer: Omit<Customer, "id" | "created_at" | "updated_at">) => {
      const { data } = await api.post<Customer>("/customers", customer);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      success("Customer contact created");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to create customer");
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...customer }: Partial<Customer> & { id: number }) => {
      const { data } = await api.put<Customer>(`/customers/${id}`, customer);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      success("Customer updated successfully");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to update customer");
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/customers/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      success("Customer contact deleted");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to delete customer");
    },
  });
};

export const useAddCustomerNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, content }: { customerId: number; content: string }) => {
      const { data } = await api.post<Note>(`/customers/${customerId}/notes`, { content });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customerNotes", variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
};

// 3. Leads Hooks
export const useLeads = (search = "", status = "", priority = "", assignedId?: number) => {
  return useQuery({
    queryKey: ["leads", search, status, priority, assignedId],
    queryFn: async () => {
      const { data } = await api.get<{ items: Lead[]; total: number }>("/leads", {
        params: { search, status, priority, assigned_employee_id: assignedId },
      });
      return data.items;
    },
  });
};

export const useLead = (id?: number) => {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<Lead>(`/leads/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useLeadNotes = (leadId?: number) => {
  return useQuery({
    queryKey: ["leadNotes", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      const { data } = await api.get<Note[]>(`/leads/${leadId}/notes`);
      return data;
    },
    enabled: !!leadId,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (lead: Omit<Lead, "id" | "created_at" | "updated_at">) => {
      const { data } = await api.post<Lead>("/leads", lead);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      success("Lead opportunity added to pipeline");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to create lead");
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...lead }: Partial<Lead> & { id: number }) => {
      const { data } = await api.put<Lead>(`/leads/${id}`, lead);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      success("Lead updated successfully");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to update lead");
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/leads/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      success("Lead deleted successfully");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to delete lead");
    },
  });
};

export const useAddLeadNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ leadId, content }: { leadId: number; content: string }) => {
      const { data } = await api.post<Note>(`/leads/${leadId}/notes`, { content });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leadNotes", variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
};

// 4. Tasks Hooks
export const useTasks = (isCompleted?: boolean) => {
  return useQuery({
    queryKey: ["tasks", isCompleted],
    queryFn: async () => {
      const { data } = await api.get<CRMTask[]>("/tasks", {
        params: { is_completed: isCompleted },
      });
      return data;
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (task: Omit<CRMTask, "id" | "created_at" | "updated_at" | "is_completed"> & { is_completed?: boolean }) => {
      const { data } = await api.post<CRMTask>("/tasks", task);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      success("Task scheduled successfully");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to create task");
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...task }: Partial<CRMTask> & { id: number }) => {
      const { data } = await api.put<CRMTask>(`/tasks/${id}`, task);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      success("Task updated");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to update task");
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/tasks/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      success("Task removed");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to delete task");
    },
  });
};

// 5. Meetings Hooks
export const useMeetings = () => {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data } = await api.get<Meeting[]>("/meetings");
      return data;
    },
  });
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (meeting: Omit<Meeting, "id" | "created_at" | "updated_at">) => {
      const { data } = await api.post<Meeting>("/meetings", meeting);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      success("Meeting scheduled");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to schedule meeting");
    },
  });
};

export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/meetings/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      success("Meeting cancelled");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to cancel meeting");
    },
  });
};

// 6. Analytics Hooks
export const useAnalytics = () => {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const { data } = await api.get("/analytics");
      return data;
    },
    refetchOnWindowFocus: false,
  });
};

// 7. Recent Activities Hooks
export const useActivities = (limit = 20) => {
  return useQuery({
    queryKey: ["activities", limit],
    queryFn: async () => {
      const { data } = await api.get<CRMActivity[]>("/activities", { params: { limit } });
      return data;
    },
  });
};

// 8. Notifications Hooks
export const useNotifications = (unreadOnly = false) => {
  return useQuery({
    queryKey: ["notifications", unreadOnly],
    queryFn: async () => {
      const { data } = await api.get<CRMNotification[]>("/notifications", { params: { unread_only: unreadOnly } });
      return data;
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.put(`/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.put("/notifications/read-all");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// 9. Admin User Management Hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get<any[]>("/users");
      return data;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await api.post("/users", userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      success("User created successfully");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to create user");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/users/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      success("User deleted successfully");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to delete user");
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...userData }: { id: number; name?: string; email?: string; phone?: string; role?: string; password?: string }) => {
      const { data } = await api.put(`/users/${id}`, userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      success("User updated successfully");
    },
    onError: (err: any) => {
      error(err.response?.data?.detail || "Failed to update user");
    },
  });
};
