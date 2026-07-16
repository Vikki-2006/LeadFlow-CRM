import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useCustomers, useCreateCustomer, useDeleteCustomer, useCompanies 
} from "../hooks/useCRM";
import { useAuth } from "../context/AuthContext";
import { 
  Search, Plus, ChevronLeft, ChevronRight, Trash2, 
  Eye, RefreshCw, X
} from "lucide-react";

const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email").or(z.literal("")),
  phone: z.string().optional(),
  company_id: z.coerce.number().optional().nullable(),
  job_title: z.string().optional(),
  status: z.string().default("Active"),
});

type CustomerFormType = z.infer<typeof customerSchema>;

export const Customers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data: customersData, isLoading, refetch } = useCustomers(search, statusFilter, undefined, page, 10);
  const { data: companiesData } = useCompanies("", 1, 100); // For dropdown listing
  const createMut = useCreateCustomer();
  const deleteMut = useDeleteCustomer();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormType>({
    resolver: zodResolver(customerSchema),
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ search: e.target.value, page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ search, page: newPage.toString() });
  };

  const onSubmit = async (data: CustomerFormType) => {
    try {
      // Clean blank email
      const payload = {
        ...data,
        email: data.email === "" ? undefined : data.email,
        company_id: data.company_id || undefined
      };
      await createMut.mutateAsync(payload);
      reset();
      setModalOpen(false);
    } catch (err) {}
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm("Are you sure you want to delete this customer contact? This action is permanent.")) {
      await deleteMut.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Customers</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">View and manage contact accounts.</p>
        </div>
        <button
          onClick={() => { reset(); setModalOpen(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex items-center w-full md:max-w-sm">
          <Search className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 absolute left-3" />
          <input
            type="text"
            placeholder="Search name, email, job title..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setSearchParams({ search, page: "1" }); }}
            className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800 text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              {isLoading ? (
                [1, 2, 3, 4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-28" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4.5 bg-slate-100 dark:bg-zinc-800 rounded-full w-12" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-6 bg-slate-100 dark:bg-zinc-800 rounded w-14 ml-auto" /></td>
                  </tr>
                ))
              ) : !customersData || customersData.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-zinc-500 font-medium">
                    No customers found matching search filters.
                  </td>
                </tr>
              ) : (
                customersData.items.map((cust) => (
                  <tr 
                    key={cust.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-all cursor-pointer group"
                    onClick={() => navigate(`/dashboard/customers/${cust.id}`)}
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {cust.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 font-medium">{cust.job_title || "—"}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-zinc-300 font-semibold">{cust.company?.name || "—"}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 font-medium">{cust.email || "—"}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 font-medium">{cust.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cust.status === "Active" 
                          ? "bg-green-50 text-green-700 border border-green-200/50 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30" 
                          : "bg-slate-100 text-slate-600 border border-slate-200/50 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Link 
                          to={`/dashboard/customers/${cust.id}`}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {currentUser?.role === "Admin" && (
                          <button
                            onClick={(e) => handleDelete(cust.id, e)}
                            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {customersData && customersData.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/30">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Page {page} of {customersData.pages}
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="p-1.5 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= customersData.pages}
                onClick={() => handlePageChange(page + 1)}
                className="p-1.5 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal - Add Customer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden z-10 p-6 space-y-6 transform transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Customer</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Contact Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                />
                {errors.name && <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Email Address</label>
                <input
                  type="email"
                  placeholder="john.doe@company.com"
                  {...register("email")}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                />
                {errors.email && <span className="text-[10px] text-red-500 font-semibold">{errors.email.message}</span>}
              </div>

              {/* Phone & Job Title */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Phone</label>
                  <input
                    type="text"
                    placeholder="555-0100"
                    {...register("phone")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Job Title</label>
                  <input
                    type="text"
                    placeholder="VP Procurement"
                    {...register("job_title")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Company & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Assign Company</label>
                  <select
                    {...register("company_id")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="">No Company</option>
                    {companiesData?.items.map(comp => (
                      <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Status</label>
                  <select
                    {...register("status")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1"
                >
                  {createMut.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
